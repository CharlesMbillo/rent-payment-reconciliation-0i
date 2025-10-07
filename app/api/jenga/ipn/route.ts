import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const supabase = await createClient()

  try {
    // Get request details
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"
    const signature = request.headers.get("x-jenga-signature")

    // Parse request body
    const body = await request.json()

    // Get IPN configuration
    const { data: config, error: configError } = await supabase
      .from("ipn_config")
      .select("*")
      .eq("is_active", true)
      .single()

    if (configError || !config) {
      return NextResponse.json(
        { success: false, message: "IPN processing is not configured or inactive" },
        { status: 503 },
      )
    }

    // Verify signature
    let signatureValid = false
    if (signature && config.webhook_secret) {
      const expectedSignature = crypto
        .createHmac("sha256", config.webhook_secret)
        .update(JSON.stringify(body))
        .digest("hex")

      signatureValid = signature === expectedSignature
    }

    // Log the IPN
    const { data: logData, error: logError } = await supabase
      .from("ipn_logs")
      .insert({
        transaction_ref: body.transactionRef || body.transaction_ref || "unknown",
        request_payload: body,
        signature: signature,
        signature_valid: signatureValid,
        status: "received",
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (logError) {
      console.error("Error logging IPN:", logError)
    }

    // Reject if signature is invalid
    if (signature && !signatureValid) {
      await supabase
        .from("ipn_logs")
        .update({
          status: "failed",
          error_message: "Invalid signature",
          response_time_ms: Date.now() - startTime,
          processed_at: new Date().toISOString(),
        })
        .eq("id", logData?.id)

      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 })
    }

    // Process the payment
    try {
      // Update log status to processing
      await supabase.from("ipn_logs").update({ status: "processing" }).eq("id", logData?.id)

      // Find the payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select("*")
        .eq("reference_number", body.transactionRef || body.transaction_ref)
        .single()

      if (paymentError || !payment) {
        // Create new payment record
        const { data: newPayment, error: createError } = await supabase
          .from("payments")
          .insert({
            amount: body.amount,
            payment_date: body.timestamp || new Date().toISOString(),
            status: body.status === "SUCCESS" ? "paid" : body.status === "PARTIAL" ? "partial" : "failed",
            payment_method: body.paymentMethod || "Jenga PGW",
            reference_number: body.transactionRef || body.transaction_ref,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          throw new Error("Failed to create payment record")
        }

        // Update log with success
        await supabase
          .from("ipn_logs")
          .update({
            payment_id: newPayment.id,
            status: "success",
            response_payload: { success: true, paymentId: newPayment.id },
            response_time_ms: Date.now() - startTime,
            processed_at: new Date().toISOString(),
          })
          .eq("id", logData?.id)

        return NextResponse.json({
          success: true,
          message: "Payment processed successfully",
          paymentId: newPayment.id,
        })
      } else {
        // Update existing payment
        await supabase
          .from("payments")
          .update({
            status: body.status === "SUCCESS" ? "paid" : body.status === "PARTIAL" ? "partial" : "failed",
            payment_date: body.timestamp || new Date().toISOString(),
          })
          .eq("id", payment.id)

        // Update log with success
        await supabase
          .from("ipn_logs")
          .update({
            payment_id: payment.id,
            status: "success",
            response_payload: { success: true, paymentId: payment.id },
            response_time_ms: Date.now() - startTime,
            processed_at: new Date().toISOString(),
          })
          .eq("id", logData?.id)

        return NextResponse.json({
          success: true,
          message: "Payment updated successfully",
          paymentId: payment.id,
        })
      }
    } catch (processingError: any) {
      // Update log with failure
      await supabase
        .from("ipn_logs")
        .update({
          status: "failed",
          error_message: processingError.message,
          response_time_ms: Date.now() - startTime,
          processed_at: new Date().toISOString(),
        })
        .eq("id", logData?.id)

      return NextResponse.json({ success: false, message: processingError.message }, { status: 500 })
    }
  } catch (error: any) {
    console.error("IPN processing error:", error)
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 })
  }
}

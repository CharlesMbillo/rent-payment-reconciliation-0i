-- Seeding with simpler property structure and sample tenants
-- Seed initial properties
INSERT INTO properties (name, address, rent_amount) VALUES
  ('Block A - Unit 101', 'Nairobi, Kenya', 4500.00),
  ('Block A - Unit 102', 'Nairobi, Kenya', 4500.00),
  ('Block A - Unit 103', 'Nairobi, Kenya', 4500.00),
  ('Block B - Unit 201', 'Nairobi, Kenya', 5000.00),
  ('Block B - Unit 202', 'Nairobi, Kenya', 5000.00),
  ('Block C - Shop 1', 'Nairobi, Kenya', 8000.00),
  ('Block C - Shop 2', 'Nairobi, Kenya', 8000.00),
  ('Block D - Unit 301', 'Nairobi, Kenya', 4200.00)
ON CONFLICT DO NOTHING;

-- Seed sample tenants
INSERT INTO tenants (property_id, name, email, phone, lease_start, lease_end) VALUES
  (1, 'John Kamau', 'john.kamau@email.com', '+254712345678', '2024-01-01', '2024-12-31'),
  (2, 'Mary Wanjiku', 'mary.w@email.com', '+254723456789', '2024-02-01', '2025-01-31'),
  (4, 'Peter Omondi', 'peter.o@email.com', '+254734567890', '2024-01-15', '2024-12-31'),
  (6, 'Sarah Akinyi', 'sarah.a@email.com', '+254745678901', '2023-12-01', '2024-11-30')
ON CONFLICT DO NOTHING;

-- Seed sample payments
INSERT INTO payments (tenant_id, property_id, amount, payment_date, due_date, status, payment_method, reference_number) VALUES
  (1, 1, 4500.00, '2024-01-05', '2024-01-01', 'paid', 'M-Pesa', 'REF001'),
  (2, 2, 5000.00, '2024-02-03', '2024-02-01', 'paid', 'Bank Transfer', 'REF002'),
  (3, 4, 5000.00, '2024-01-20', '2024-01-15', 'paid', 'M-Pesa', 'REF003'),
  (4, 6, 8000.00, '2024-01-10', '2024-01-01', 'paid', 'Cash', 'REF004')
ON CONFLICT DO NOTHING;

-- Seed sample maintenance requests
INSERT INTO maintenance_requests (property_id, tenant_id, title, description, priority, status) VALUES
  (1, 1, 'Leaking faucet', 'Kitchen faucet is dripping constantly', 'medium', 'open'),
  (6, 4, 'Broken door lock', 'Shop entrance lock needs replacement', 'high', 'in_progress'),
  (2, 2, 'Paint peeling', 'Bedroom walls need repainting', 'low', 'open')
ON CONFLICT DO NOTHING;

-- Seed properties with actual room structure for all blocks
-- Block A: 224 rooms (28 per floor, 8 floors)
-- Block B: 231 rooms (28 per floor for 8 floors + 7 on 8th floor)
-- Block C: 224 rooms (28 per floor, 8 floors)
-- Block D: 358 rooms (42 per floor for 8 floors + 22 on 8th floor)
-- Block E: 350 rooms (42 per floor for 8 floors + 14 on 8th floor)
-- Block F: 234 rooms (28 per floor for 8 floors + 10 on 8th floor)
-- Block G: 234 rooms (28 per floor for 8 floors + 10 on 8th floor)
-- Block H: 74 rooms (9 per floor for 8 floors + 2 on 8th floor)

DO $$
DECLARE
  block_configs JSONB := '[
    {"block": "A", "total": 224, "per_floor": 28, "last_floor": 28},
    {"block": "B", "total": 231, "per_floor": 28, "last_floor": 7},
    {"block": "C", "total": 224, "per_floor": 28, "last_floor": 28},
    {"block": "D", "total": 358, "per_floor": 42, "last_floor": 22},
    {"block": "E", "total": 350, "per_floor": 42, "last_floor": 14},
    {"block": "F", "total": 234, "per_floor": 28, "last_floor": 10},
    {"block": "G", "total": 234, "per_floor": 28, "last_floor": 10},
    {"block": "H", "total": 74, "per_floor": 9, "last_floor": 2}
  ]'::JSONB;
  
  config JSONB;
  block_name TEXT;
  total_rooms INT;
  rooms_per_floor INT;
  last_floor_rooms INT;
  floor_num INT;
  room_num INT;
  room_count INT;
  property_name TEXT;
  rent_amount DECIMAL(10,2);
  is_shop BOOLEAN;
BEGIN
  -- Loop through each block configuration
  FOR config IN SELECT * FROM jsonb_array_elements(block_configs)
  LOOP
    block_name := config->>'block';
    total_rooms := (config->>'total')::INT;
    rooms_per_floor := (config->>'per_floor')::INT;
    last_floor_rooms := (config->>'last_floor')::INT;
    
    room_count := 0;
    
    -- Generate rooms for each floor (Ground Floor = 0 to 7th Floor = 7)
    FOR floor_num IN 0..7
    LOOP
      -- Determine how many rooms on this floor
      FOR room_num IN 1..rooms_per_floor
      LOOP
        EXIT WHEN room_count >= total_rooms;
        
        -- Ground floor has some shops (20% chance)
        is_shop := floor_num = 0 AND random() < 0.2;
        
        -- Set rent based on type
        rent_amount := CASE 
          WHEN is_shop THEN 8000.00
          ELSE 4500.00
        END;
        
        -- Create property name
        property_name := 'Block ' || block_name || ' - ' || 
                        CASE WHEN is_shop THEN 'Shop ' ELSE 'Room ' END ||
                        room_num;
        
        -- Insert property
        INSERT INTO properties (name, address, rent_amount)
        VALUES (property_name, 'Nairobi, Kenya', rent_amount)
        ON CONFLICT DO NOTHING;
        
        room_count := room_count + 1;
      END LOOP;
    END LOOP;
    
    -- Handle 8th floor if there are remaining rooms
    IF room_count < total_rooms THEN
      FOR room_num IN 1..last_floor_rooms
      LOOP
        EXIT WHEN room_count >= total_rooms;
        
        rent_amount := 4500.00;
        property_name := 'Block ' || block_name || ' - Room ' || room_num;
        
        INSERT INTO properties (name, address, rent_amount)
        VALUES (property_name, 'Nairobi, Kenya', rent_amount)
        ON CONFLICT DO NOTHING;
        
        room_count := room_count + 1;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Seed sample tenants for some properties
INSERT INTO tenants (property_id, name, email, phone, lease_start, lease_end) 
SELECT 
  p.id,
  'Tenant ' || p.id,
  'tenant' || p.id || '@email.com',
  '+25471' || LPAD((random() * 10000000)::INT::TEXT, 7, '0'),
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '6 months'
FROM properties p
WHERE random() < 0.7  -- 70% occupancy rate
LIMIT 100
ON CONFLICT DO NOTHING;

-- Seed sample payments for tenants
INSERT INTO payments (tenant_id, property_id, amount, payment_date, due_date, status, payment_method, reference_number)
SELECT 
  t.id,
  t.property_id,
  p.rent_amount,
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE - INTERVAL '10 days',
  CASE 
    WHEN random() < 0.8 THEN 'paid'
    WHEN random() < 0.9 THEN 'partial'
    ELSE 'overdue'
  END,
  CASE 
    WHEN random() < 0.6 THEN 'M-Pesa'
    WHEN random() < 0.9 THEN 'Bank Transfer'
    ELSE 'Cash'
  END,
  'REF' || LPAD((random() * 1000000)::INT::TEXT, 6, '0')
FROM tenants t
JOIN properties p ON t.property_id = p.id
WHERE random() < 0.9  -- 90% have made payments
ON CONFLICT DO NOTHING;

-- Seed sample maintenance requests
INSERT INTO maintenance_requests (property_id, tenant_id, title, description, priority, status)
SELECT 
  t.property_id,
  t.id,
  CASE (random() * 5)::INT
    WHEN 0 THEN 'Leaking faucet'
    WHEN 1 THEN 'Broken door lock'
    WHEN 2 THEN 'Paint peeling'
    WHEN 3 THEN 'Electrical issue'
    ELSE 'Plumbing problem'
  END,
  'Maintenance required for this unit',
  CASE (random() * 3)::INT
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    ELSE 'high'
  END,
  CASE (random() * 3)::INT
    WHEN 0 THEN 'open'
    WHEN 1 THEN 'in_progress'
    ELSE 'resolved'
  END
FROM tenants t
WHERE random() < 0.15  -- 15% have maintenance requests
LIMIT 50
ON CONFLICT DO NOTHING;

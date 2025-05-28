-- Add contact number and delivery address to orders table
ALTER TABLE orders 
ADD COLUMN contact_number VARCHAR(50) NOT NULL DEFAULT '',
ADD COLUMN delivery_address TEXT NOT NULL DEFAULT '';

-- Remove default constraints after adding the columns
ALTER TABLE orders 
ALTER COLUMN contact_number DROP DEFAULT,
ALTER COLUMN delivery_address DROP DEFAULT;

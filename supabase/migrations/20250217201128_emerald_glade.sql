/*
  # Add storage and alterations description support

  1. Storage Setup
    - Create garment-photos bucket
    - Enable RLS for storage
    - Add storage policies

  2. Orders Updates
    - Add support for alterations descriptions
    - Add support for photo storage
    - Add indexes for performance

  3. Security
    - Add RLS policies for storage access
*/

-- Create storage bucket for garment photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('garment-photos', 'garment-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'garment-photos');

CREATE POLICY "Allow authenticated users to upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'garment-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create function to update garments JSONB
CREATE OR REPLACE FUNCTION update_garment_info()
RETURNS void AS $$
DECLARE
  order_record RECORD;
  updated_garments JSONB;
  garment JSONB;
BEGIN
  FOR order_record IN SELECT id, garments FROM orders
  LOOP
    updated_garments = '[]'::jsonb;
    
    FOR garment IN SELECT * FROM jsonb_array_elements(order_record.garments)
    LOOP
      -- Add alterationsDescription if not exists
      IF NOT garment->'garmentInfo' ? 'alterationsDescription' THEN
        garment = jsonb_set(
          garment,
          '{garmentInfo,alterationsDescription}',
          '""'::jsonb
        );
      END IF;

      -- Add photos array if not exists
      IF NOT garment->'garmentInfo' ? 'photos' THEN
        garment = jsonb_set(
          garment,
          '{garmentInfo,photos}',
          '[]'::jsonb
        );
      END IF;

      updated_garments = updated_garments || jsonb_build_array(garment);
    END LOOP;

    -- Update the order with modified garments
    UPDATE orders 
    SET garments = updated_garments
    WHERE id = order_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the update function
SELECT update_garment_info();

-- Add function to handle photo URL updates
CREATE OR REPLACE FUNCTION handle_storage_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the photo URL in the orders table
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Extract order ID from path
    -- Assuming path format: garment-photos/{order_id}/{timestamp}.jpg
    UPDATE orders
    SET garments = (
      SELECT jsonb_agg(
        CASE 
          WHEN garment->'garmentInfo'->'photos' @> jsonb_build_array(jsonb_build_object('url', OLD.name::text))
          THEN jsonb_set(
            garment,
            '{garmentInfo,photos}',
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN photo->>'url' = OLD.name 
                  THEN jsonb_set(photo, '{url}', to_jsonb(NEW.name))
                  ELSE photo
                END
              )
              FROM jsonb_array_elements(garment->'garmentInfo'->'photos') photo
            )
          )
          ELSE garment
        END
      )
      FROM jsonb_array_elements(orders.garments) garment
    )
    WHERE id = (regexp_split_to_array(NEW.name, '/'))[2];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for storage updates
DROP TRIGGER IF EXISTS on_storage_update ON storage.objects;
CREATE TRIGGER on_storage_update
  AFTER INSERT OR UPDATE
  ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION handle_storage_update();

-- Add index for faster photo lookups
CREATE INDEX IF NOT EXISTS idx_garments_photos ON orders USING gin ((garments->'garmentInfo'->'photos'));

COMMENT ON TABLE storage.objects IS 'Stores garment photos with secure access control';
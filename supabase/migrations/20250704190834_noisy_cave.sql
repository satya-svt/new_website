/*
  # Add user email tracking to data_rows table

  1. Changes
    - Add `user_email` column to `data_rows` table to track which user submitted each response
    - Column allows null values for backward compatibility with existing data
    - Add index on user_email for better query performance

  2. Security
    - No changes to existing RLS policies needed
    - Email column will be populated from authenticated user's session
*/

-- Add user_email column to track survey submissions by user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'data_rows' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE data_rows ADD COLUMN user_email text;
  END IF;
END $$;

-- Add index for better query performance when filtering by user email
CREATE INDEX IF NOT EXISTS idx_data_rows_user_email ON data_rows(user_email);

-- Add comment to document the new column
COMMENT ON COLUMN data_rows.user_email IS 'Email address of the authenticated user who submitted this survey response';
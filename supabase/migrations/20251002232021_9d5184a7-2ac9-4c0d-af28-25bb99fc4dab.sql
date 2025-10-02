-- Update notifications type check constraint to include order notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'ride_request'::text, 
  'request_accepted'::text, 
  'request_rejected'::text, 
  'ride_started'::text, 
  'ride_completed'::text, 
  'new_message'::text,
  'order'::text,
  'system'::text
]));
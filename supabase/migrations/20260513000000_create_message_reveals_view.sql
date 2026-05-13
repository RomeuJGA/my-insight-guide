CREATE OR REPLACE VIEW message_reveals_view AS
SELECT
  mr.id,
  mr.user_id,
  mr.message_id,
  mr.revealed_at,
  mr.question,
  mr.notes,
  p.full_name   AS user_name,
  u.email       AS user_email
FROM message_reveals mr
LEFT JOIN profiles p ON p.user_id = mr.user_id
LEFT JOIN auth.users u ON u.id = mr.user_id;

-- backup of migrations rows for transaction_histories
-- generated: 2025-08-27
DELETE FROM migrations WHERE migration LIKE '%transaction_histories%';
INSERT INTO migrations (migration, batch) VALUES
('2025_08_26_000000_create_transaction_histories_table', 1),
('2025_08_27_120000_add_transaction_time_to_transaction_histories_table', 2),
('2025_08_28_000000_create_transaction_histories_if_missing', 2);

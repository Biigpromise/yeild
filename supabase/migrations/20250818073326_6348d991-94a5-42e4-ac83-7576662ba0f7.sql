-- Process the latest unprocessed payment transaction
DO $$
DECLARE
    payment_record RECORD;
    wallet_transaction_id UUID;
BEGIN
    -- Get the unprocessed payment
    SELECT * INTO payment_record 
    FROM payment_transactions 
    WHERE transaction_ref = 'flw_1755473098602_1f952d00' 
    AND status = 'successful' 
    AND payment_type = 'wallet_funding';
    
    IF FOUND THEN
        -- Check if this payment has already been processed
        IF NOT EXISTS (
            SELECT 1 FROM brand_wallet_transactions 
            WHERE payment_transaction_id = payment_record.id
        ) THEN
            -- Process the wallet transaction
            SELECT process_wallet_transaction(
                payment_record.user_id,
                'deposit',
                payment_record.amount,
                'Wallet funding payment: ' || payment_record.transaction_ref,
                payment_record.id,
                NULL,
                payment_record.id
            ) INTO wallet_transaction_id;
            
            RAISE NOTICE 'Processed payment % with transaction ID %', payment_record.transaction_ref, wallet_transaction_id;
        ELSE
            RAISE NOTICE 'Payment % already processed', payment_record.transaction_ref;
        END IF;
    ELSE
        RAISE NOTICE 'Payment flw_1755473098602_1f952d00 not found or not successful';
    END IF;
END $$;
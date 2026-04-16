-- SUPER SYNC: RUN THIS IN SUPABASE SQL EDITOR
-- This will "heal" your inventory, fix the jumps, and reset the counter to 817.

DO $$
DECLARE
    r RECORD;
    i INT := 1;
BEGIN
    -- 1. Re-index all perfumes perfectly from 1 to N
    FOR r IN (SELECT id FROM perfumes ORDER BY display_id ASC) LOOP
        UPDATE perfumes SET display_id = i WHERE id = r.id;
        i := i + 1;
    END LOOP;
    
    -- 2. Force the counter to the correct next number (817)
    PERFORM setval('perfumes_display_id_seq', i, false);
    
    RAISE NOTICE 'Inventory healed. Total items: %. Next ID: %', i - 1, i;
END $$;

-- 3. Re-install the automatic cleaning tool (Gapless Inventory)
CREATE OR REPLACE FUNCTION delete_perfume_and_sync(target_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_display_id INTEGER;
BEGIN
    -- 1. Get the display_id of the item being deleted
    SELECT display_id INTO deleted_display_id FROM perfumes WHERE id = target_id;
    
    -- 2. Delete the item
    DELETE FROM perfumes WHERE id = target_id;
    
    -- 3. Shift all subsequent items down by 1
    UPDATE perfumes 
    SET display_id = display_id - 1 
    WHERE display_id > deleted_display_id;
    
    -- 4. Reset the sequence to the current max + 1
    PERFORM setval('perfumes_display_id_seq', COALESCE((SELECT MAX(display_id) FROM perfumes), 0) + 1, false);
END;
$$;

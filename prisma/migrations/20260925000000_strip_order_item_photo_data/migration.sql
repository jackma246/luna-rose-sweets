-- Remove base64 photo data from Order.items.
--
-- Order requests used to store each inspiration photo twice: as a file on the uploads volume (an
-- "OrderImage" row, which the retention job deletes) and as a base64 "dataUrl" inside the order's
-- items JSON, which was never deleted. The API no longer stores dataUrl; this strips it from existing
-- rows, keeping each photo's name, type and size. Admin shows photos from "OrderImage", not from here.
UPDATE "Order" AS o
SET "items" = (
  SELECT jsonb_agg(
    CASE
      WHEN jsonb_typeof(item) = 'object' AND jsonb_typeof(item -> 'inspirationImages') = 'array' THEN
        jsonb_set(
          item,
          '{inspirationImages}',
          (
            SELECT COALESCE(
              jsonb_agg(CASE WHEN jsonb_typeof(img) = 'object' THEN img - 'dataUrl' ELSE img END ORDER BY img_ord),
              '[]'::jsonb
            )
            FROM jsonb_array_elements(item -> 'inspirationImages') WITH ORDINALITY AS imgs(img, img_ord)
          )
        )
      ELSE item
    END
    ORDER BY item_ord
  )
  FROM jsonb_array_elements(o."items") WITH ORDINALITY AS elems(item, item_ord)
)
WHERE jsonb_typeof(o."items") = 'array'
  AND o."items" @? '$[*].inspirationImages[*].dataUrl';


-- Marketplace images: restrict delete to owner folder
DROP POLICY IF EXISTS "Brands can delete their marketplace images" ON storage.objects;
CREATE POLICY "Brands can delete their marketplace images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'marketplace-images'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Also tighten marketplace upload to owner folder
DROP POLICY IF EXISTS "Brands can upload marketplace images" ON storage.objects;
CREATE POLICY "Brands can upload marketplace images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'marketplace-images'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Stories: replace owner-based check with folder-path ownership
DROP POLICY IF EXISTS "Allow authenticated users to upload stories" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload stories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stories'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Campaign approval requests: brands can create for their own campaigns
CREATE POLICY "Brands can create approval requests for their campaigns"
ON public.campaign_approval_requests FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.brand_campaigns bc
    WHERE bc.id = campaign_id AND bc.brand_id = auth.uid()
  )
);

-- Campaign fees: admin full access
CREATE POLICY "Admins can manage campaign fees"
ON public.campaign_fees FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Dispute resolutions: admin full access
CREATE POLICY "Admins can manage dispute resolutions"
ON public.dispute_resolutions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Withdrawal requests: admin full access
CREATE POLICY "Admins can manage withdrawal requests"
ON public.withdrawal_requests FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

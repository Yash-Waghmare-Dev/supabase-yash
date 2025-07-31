import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCorsSettings() {
  try {
    // First, make sure the bucket exists and is public
    const { data: bucketData, error: bucketError } = await supabase.storage
      .updateBucket('images', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 1024 * 1024 * 5, // 5MB
      });

    if (bucketError) {
      console.error('Error updating bucket settings:', bucketError);
      return;
    }

    console.log('Bucket updated successfully:', bucketData);

    // Set CORS configuration
    const { data: corsData, error: corsError } = await supabase
      .storage
      .setCorsConfig({
        allowedOrigins: [
          'http://localhost:3000',
          'https://auoohjiiorpwfjddzalb.supabase.co',
          'https://*.vercel.app',
          'https://*.supabase.demovilla.com'
        ],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['*'],
        maxAgeSeconds: 3600,
      });

    if (corsError) {
      console.error('Error setting CORS:', corsError);
      return;
    }

    console.log('CORS configuration updated successfully:', corsData);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateCorsSettings();

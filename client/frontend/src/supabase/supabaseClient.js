import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload image to Supabase Storage with public access
 * @param {File} file - The image file to upload
 * @param {string} folder - Subfolder in bucket (e.g., 'item-images')
 * @returns {Promise<{url: string, path: string}>} - Public URL and storage path
 */
export const uploadImage = async (file, folder = "item-images") => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const path = `${folder}/${filename}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from("Listing-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("Listing-images").getPublicUrl(path);

    return {
      url: publicUrl,
      path: path,
    };
  } catch (err) {
    console.error("Image upload error:", err);
    throw err;
  }
};

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupAdmin() {
  const email = 'annycatarina01@gmail.com';
  const password = 'Anny@2026!'; // Default password for setup
  const name = 'Anny Catarina';

  console.log(`Setting up admin user: ${email}...`);

  try {
    // 1. Try to sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        console.log("User already exists in Supabase Auth.");
      } else {
        throw authError;
      }
    } else {
      console.log("User successfully signed up.");
    }

    // 2. Check or Create Organization
    console.log("Checking for organization...");
    let { data: org, error: orgError } = await supabase
      .from('organizations')
      .select()
      .limit(1);

    if (orgError) throw orgError;

    if (!org || org.length === 0) {
      console.log("Creating new organization...");
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert({ name: `Organização de ${name}` })
        .select()
        .single();
      
      if (createOrgError) throw createOrgError;
      org = [newOrg];
      console.log(`Organization created: ${org[0].name}`);
    } else {
      console.log(`Using existing organization: ${org[0].name}`);
    }

    console.log("\nSetup complete! Recommendations:");
    console.log("1. Go to Supabase Dashboard > Authentication > Users");
    console.log(`2. If ${email} exists, ensure 'Email Confirmed' is checked.`);
    console.log(`3. Try logging in at the app with password: ${password}`);

  } catch (err: any) {
    console.error("Setup failed:", err.message);
  }
}

setupAdmin();

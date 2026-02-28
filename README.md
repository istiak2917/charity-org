# Charity Organization Website

This is a complete website system for running a charity or organization website.

You can use this project to create your own website by making a copy and setting up your own database.

---

# 🚀 How To Make Your Own Copy (Fork This Project)

## 📱 Using Mobile

1. Log in to your GitHub account.
2. Open this repository page.
3. Tap the **Fork** button at the top right.
4. Select your profile.
5. Wait a few seconds.

Now this project is copied into your own GitHub account.

---

# 💻 Download to Your Computer (Clone)

1. Open your forked repository.
2. Tap the green **Code** button.
3. Copy the HTTPS link.
4. Run the following commands:

```sh
git clone YOUR_REPOSITORY_LINK
cd PROJECT_NAME
npm install
npm run dev
```

---

# 🗄 Database Setup (Supabase)

1. Go to: https://supabase.com
2. Create a new account or log in.
3. Click **New Project**.
4. After creation, go to:

   Project Settings → API

5. Copy:
   - Project URL
   - anon public key

---

# 🔐 Create Environment File

In your project root folder, create a file named:

```
.env
```

Inside that file, paste:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Save the file.

⚠ Never upload the `.env` file to GitHub.

---

# 🌍 Deploy on Vercel (Recommended)

1. Go to: https://vercel.com
2. Log in using GitHub.
3. Click **New Project**.
4. Select your forked repository.
5. Add Environment Variables (same values from `.env`).
6. Click **Deploy**.

Your site will be live in a few minutes.

---

# 🌐 Connect a Custom Domain

1. Open your project on Vercel.
2. Go to Settings → Domains.
3. Add your domain.
4. Follow the DNS instructions shown by Vercel.

---

# 🌍 Deploy on Custom Hosting

If using your own hosting provider:

1. Run:

```sh
npm run build
```

2. Upload the generated build folder.
3. Make sure Node.js is supported.
4. Set the environment variables correctly.

---

# 🔄 How To Get Future Updates

If you forked this repository:

1. Open your fork.
2. Tap **Sync fork**.
3. Click **Update branch**.

You will receive the latest updates.

---

# 🛡 Important Rules

- Do NOT upload `.env` file.
- Do NOT share your Supabase keys.
- Each organization must create its own Supabase project.
- Do not use another organization’s database.

---

# 🧠 Technologies Used

- React
- TypeScript
- Tailwind CSS
- Supabase
- Vite

---

# 📜 Usage License

This project can be used for free only with permission from the project creator.

You are allowed to:
- Use it for your organization
- Modify it for your needs

You are NOT allowed to:
- Resell this project
- Redistribute without permission

Please contact the project creator before using.

---

# ❤️ Final Note

Make your copy.
Set up your database.
Deploy.
Launch your organization website.

Success 🚀

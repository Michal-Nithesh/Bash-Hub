# StudentHub - Student Innovator & Productivity Platform

> 🎓 **Ultimate platform for student productivity, learning, and community**

StudentHub is a comprehensive web application designed specifically for ambitious students to track their progress, compete with peers, and achieve academic excellence. Built with modern technologies and designed for the student community in Kanyakumari district.

## ✨ Features

### 🏆 **Leaderboard & Competition**
- Rank students based on LeetCode problems solved + local points
- Track daily streaks and maintain consistency
- College-wise filtering and search
- Real-time ranking updates

### 📅 **Smart Timetable Management**
- Interactive timetable editor (Mon-Sat, 8 periods/day)
- Task integration with specific time periods
- Notes and reminders for each period
- Visual progress tracking

### 🛍️ **Student Marketplace**
- Buy and sell used books, instruments, and study materials
- Student-to-student marketplace with ratings
- Price comparison and condition tracking
- Request-to-buy system with messaging

### 📚 **Digital Library & Certificates**
- Upload and share academic certificates
- Filter by college and student
- Document management with Supabase Storage
- Public/private visibility controls

### 🎯 **Points & Gamification System**
- Earn points for completing daily tasks
- Visual progress charts and analytics
- Streak tracking for consistency
- Achievement badges and milestones

### 🌐 **Community Features**
- Events and exam scheduling
- FAQ and help center
- Contact system for support
- Profile management

## 🛠️ Tech Stack

- **Frontend**: React.js 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Authentication, Database, Storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Theme**: Light/Dark mode support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### 1. Clone and Install

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd studenthub

# Install dependencies
npm install
```

### 2. Supabase Setup

**Important**: This application requires Supabase for full functionality. You must:

1. **Connect to Supabase**: Click the green Supabase button in your Lovable interface and connect your project
2. **OR** Set up manually with environment variables:

```bash
# Create .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Profiles table (extends Supabase auth)
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name text,
    personal_email text,
    college_email text,
    leetcode_username text,
    linkedin_url text,
    college_name text,
    created_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner uuid REFERENCES profiles(id),
    title text,
    description text,
    date date,
    period int, -- 1..8 (links to timetable period)
    completed boolean DEFAULT false,
    points int DEFAULT 10,
    completed_at timestamptz
);

-- Timetable table
CREATE TABLE timetables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner uuid REFERENCES profiles(id),
    weekday int, -- 1=Mon .. 6=Sat
    period int, -- 1..8
    subject text,
    location text,
    notes text
);

-- Points ledger (audit trail)
CREATE TABLE points_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner uuid REFERENCES profiles(id),
    points int,
    reason text,
    created_at timestamptz DEFAULT now()
);

-- Products (store)
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner uuid REFERENCES profiles(id),
    title text,
    description text,
    price numeric,
    images text[],
    available boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Purchase requests
CREATE TABLE purchase_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id),
    buyer uuid REFERENCES profiles(id),
    message text,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- Certificates / library uploads
CREATE TABLE certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner uuid REFERENCES profiles(id),
    title text,
    description text,
    file_path text,
    visibility text DEFAULT 'public',
    created_at timestamptz DEFAULT now()
);

-- Events
CREATE TABLE events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner uuid REFERENCES profiles(id),
    title text,
    description text,
    start timestamptz,
    end timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Exams
CREATE TABLE exams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner uuid REFERENCES profiles(id),
    subject text,
    date timestamptz,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- LeetCode stats cache
CREATE TABLE leetcode_stats (
    id serial PRIMARY KEY,
    profile_id uuid REFERENCES profiles(id),
    username text,
    solved_count int,
    last_checked timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can access their own data)
CREATE POLICY "Users can view own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (auth.uid() = owner);
CREATE POLICY "Users can manage own timetable" ON timetables FOR ALL USING (auth.uid() = owner);
CREATE POLICY "Users can view own points" ON points_ledger FOR ALL USING (auth.uid() = owner);
CREATE POLICY "Users can manage own products" ON products FOR ALL USING (auth.uid() = owner);
CREATE POLICY "Users can view all products" ON products FOR SELECT USING (true);
CREATE POLICY "Users can manage purchase requests" ON purchase_requests FOR ALL USING (auth.uid() = buyer OR auth.uid() = (SELECT owner FROM products WHERE id = product_id));
CREATE POLICY "Users can manage own certificates" ON certificates FOR ALL USING (auth.uid() = owner);
CREATE POLICY "Users can view public certificates" ON certificates FOR SELECT USING (visibility = 'public' OR auth.uid() = owner);
CREATE POLICY "Users can manage own events" ON events FOR ALL USING (auth.uid() = owner);
CREATE POLICY "Users can manage own exams" ON exams FOR ALL USING (auth.uid() = owner);
```

### 4. Storage Buckets

Create the following storage buckets in Supabase:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies
CREATE POLICY "Users can upload own certificates" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view certificates" ON storage.objects FOR SELECT USING (bucket_id = 'certificates');
CREATE POLICY "Users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
```

### 5. Run the Application

```bash
# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the application.

## 🔧 Configuration

### Theme System

The application includes a comprehensive design system with light/dark mode support:

- **Light Mode**: Clean white background with vibrant green (#04a96d) accents
- **Dark Mode**: Dark background with brighter green (#04aa6d) accents
- **Components**: All shadcn/ui components are themed consistently
- **Theme Toggle**: Available in the navigation bar

### LeetCode Integration

Currently includes a placeholder for LeetCode stats integration:

```typescript
// lib/leetcode.ts - Replace with actual implementation
export async function getLeetCodeStats(username: string) {
  // TODO: Implement real LeetCode API integration
  // Options: LeetCode GraphQL API, third-party services, or web scraping
  return { solved: 0, profileUrl: `https://leetcode.com/${username}` };
}
```

**Integration Options**:
- LeetCode GraphQL API (requires authentication)
- Third-party services (LeetCode-Stats-API)
- Web scraping solutions
- Manual entry system

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Responsive Grid**: Adapts to different screen sizes
- **Touch-friendly**: Large touch targets and gestures
- **Progressive Enhancement**: Works across all devices

## 🔒 Security

- **Row Level Security (RLS)**: All database tables protected
- **Authentication**: Supabase Auth with email/password
- **File Upload**: Secure file handling with Supabase Storage
- **Input Validation**: Form validation and sanitization

## 🎨 Customization

### Colors

Update the color scheme in `src/index.css`:

```css
:root {
  --primary: 154 96% 33%;     /* Main green */
  --accent: 154 96% 33%;      /* Accent color */
  --secondary: 224 7% 81%;    /* Gray secondary */
}
```

### Components

All components are built with shadcn/ui and can be customized:

- `/src/components/ui/` - Base UI components
- `/src/components/` - Custom application components

## 🚧 Development Roadmap

### Phase 1 (Current)
- ✅ Basic UI scaffold and routing
- ✅ Authentication system structure
- ✅ Theme system with light/dark mode
- ✅ Responsive design

### Phase 2 (Next Steps - Requires Supabase)
- 🔄 Supabase authentication integration
- 🔄 Database CRUD operations
- 🔄 File upload functionality
- 🔄 Real-time updates

### Phase 3 (Future)
- 📅 LeetCode API integration
- 📅 Real-time notifications
- 📅 Advanced analytics
- 📅 Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord community (coming soon)

---

**Built with ❤️ for student success in Kanyakumari district**

*Remember to connect your Supabase project for full functionality!*
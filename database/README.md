# Bash Hub Database Setup Guide

This guide walks you through setting up the complete database schema for the Bash Hub application using Supabase.

## Overview

Bash Hub is a comprehensive platform for college students featuring:
- User profiles with LeetCode integration
- Certificate management and sharing
- Student marketplace for buying/selling items
- Competitive programming leaderboards
- Timetable management
- Events and study groups

## Prerequisites

1. A Supabase account and project
2. Supabase CLI (optional, for local development)
3. Environment variables configured in your application

## Database Architecture

### Core Tables

#### 1. **profiles** - User Information
Extends Supabase auth.users with additional profile data including LeetCode stats, college information, and social links.

#### 2. **timetables** - Class Schedules
Stores weekly class schedules with support for multiple periods per day.

#### 3. **certificates** - Achievement Management
Manages certificate uploads with categories, visibility controls, and metadata.

#### 4. **store_products** - Student Marketplace
Handles product listings for the student marketplace with images, pricing, and availability.

#### 5. **leetcode_stats** - Competitive Programming
Tracks detailed LeetCode statistics for leaderboard functionality.

### Supporting Tables

- `store_favorites` - User wishlist functionality
- `store_messages` - Buyer-seller communication
- `leetcode_submissions` - Daily problem solving tracking
- `college_rankings` - Institution-level leaderboards
- `events` - Campus events and workshops
- `event_registrations` - Event participation tracking
- `study_groups` - Collaborative study management
- `study_group_members` - Group membership tracking

## Setup Instructions

### Step 1: Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Create Database Schema

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following files in order:

**a) Main Schema (`database/schema.sql`)**
```sql
-- Copy and paste the contents of database/schema.sql
-- This creates all tables, indexes, triggers, and functions
```

**b) Security Policies (`database/policies.sql`)**
```sql
-- Copy and paste the contents of database/policies.sql
-- This sets up Row Level Security for data protection
```

**c) Storage Setup (`database/storage.sql`)**
```sql
-- Copy and paste the contents of database/storage.sql
-- This creates storage buckets and policies for file uploads
```

### Step 3: Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL and redirect URLs
3. Set up email templates if needed
4. The schema automatically creates profile records when users sign up

### Step 4: Verify Setup

After running all SQL files, verify your setup:

1. **Tables**: Check that all 13 tables are created
2. **RLS**: Ensure Row Level Security is enabled on all tables
3. **Storage**: Verify that 4 storage buckets are created
4. **Triggers**: Confirm that timestamp and counter triggers are active

## Storage Buckets

| Bucket | Purpose | Size Limit | Public | Allowed Types |
|--------|---------|------------|--------|---------------|
| `certificates` | Certificate files | 50MB | No | PDF, Images |
| `avatars` | Profile pictures | 2MB | Yes | Images |
| `product-images` | Marketplace photos | 5MB | Yes | Images |
| `event-images` | Event banners | 5MB | Yes | Images |

## Key Features

### Row Level Security (RLS)
- Users can only access their own private data
- Public data (like profiles, marketplace items) is accessible to all authenticated users
- Certificate visibility is controlled by the `visibility` field

### Automatic Triggers
- **Updated timestamps**: Automatically maintained on all tables
- **Profile creation**: Auto-creates profile when user signs up
- **LeetCode sync**: Updates profile points when LeetCode stats change
- **Counter maintenance**: Keeps favorites/member counts accurate

### Data Relationships
- All user data is linked through the `profiles` table
- Foreign keys ensure data integrity
- Cascade deletes protect against orphaned records

## Usage Examples

### Creating a User Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    full_name: 'John Doe',
    college_name: 'GEC Thiruvananthapuram',
    leetcode_username: 'johndoe123'
  });
```

### Fetching Public Certificates
```typescript
const { data, error } = await supabase
  .from('certificates')
  .select(`
    *,
    profiles(full_name, college_name)
  `)
  .eq('visibility', 'public');
```

### Getting Leaderboard Data
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('full_name, college_name, leetcode_points, total_problems_solved')
  .order('leetcode_points', { ascending: false })
  .limit(50);
```

## Security Considerations

1. **Row Level Security**: All tables have RLS enabled
2. **Storage Policies**: Files are organized by user ID in folders
3. **Data Validation**: Check constraints prevent invalid data
4. **Access Control**: Users can only modify their own data

## Maintenance

### Regular Tasks
1. **Monitor storage usage**: Check bucket sizes periodically
2. **Update LeetCode stats**: Consider setting up automated sync
3. **Clean inactive data**: Remove old events and expired certificates
4. **Backup strategy**: Implement regular database backups

### Performance Optimization
- Indexes are created on frequently queried columns
- Use `select` with specific columns to reduce data transfer
- Implement pagination for large datasets
- Consider caching for leaderboard data

## Troubleshooting

### Common Issues

**1. RLS Policy Errors**
- Ensure user is authenticated before accessing data
- Check that policies match your query patterns

**2. Storage Upload Failures**
- Verify file types and sizes are within limits
- Check that folder structure follows user ID pattern

**3. Foreign Key Violations**
- Ensure referenced records exist before creating relationships
- Handle cascade deletes appropriately

**4. Performance Issues**
- Use appropriate indexes for your query patterns
- Limit result sets with pagination
- Consider using database functions for complex operations

## Support

For additional help:
1. Check the Supabase documentation
2. Review the application code for usage examples
3. Test queries in the Supabase SQL editor
4. Use the Supabase dashboard for monitoring

## Migration Notes

If upgrading from an existing schema:
1. Backup your current data
2. Test migrations on a development database first
3. Run schema changes during low-traffic periods
4. Update your TypeScript types accordingly

---

*This documentation should be updated as the schema evolves.*
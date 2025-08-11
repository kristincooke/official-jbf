-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_theme VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tools table
CREATE TABLE tools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    website_url VARCHAR(500),
    github_url VARCHAR(500),
    pricing_model VARCHAR(50), -- 'free', 'freemium', 'paid', 'open_source'
    free_tier BOOLEAN DEFAULT false,
    logo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    pros TEXT,
    cons TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tool_id, user_id) -- One review per user per tool
);

-- Tool scores table
CREATE TABLE tool_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE UNIQUE,
    accessibility_score DECIMAL(3,2) NOT NULL CHECK (accessibility_score >= 0 AND accessibility_score <= 5),
    performance_score DECIMAL(3,2) NOT NULL CHECK (performance_score >= 0 AND performance_score <= 5),
    innovation_score DECIMAL(3,2) NOT NULL CHECK (innovation_score >= 0 AND innovation_score <= 5),
    enterprise_score DECIMAL(3,2) NOT NULL CHECK (enterprise_score >= 0 AND enterprise_score <= 5),
    overall_score DECIMAL(3,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tools_category_id ON tools(category_id);
CREATE INDEX idx_tools_created_at ON tools(created_at DESC);
CREATE INDEX idx_reviews_tool_id ON reviews(tool_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_tool_scores_tool_id ON tool_scores(tool_id);

-- Row Level Security (RLS) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_scores ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories are insertable by authenticated users" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Tools policies (public read, authenticated write)
CREATE POLICY "Tools are viewable by everyone" ON tools FOR SELECT USING (true);
CREATE POLICY "Tools are insertable by authenticated users" ON tools FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Tools are updatable by authenticated users" ON tools FOR UPDATE USING (auth.role() = 'authenticated');

-- Reviews policies (public read, own reviews write)
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Tool scores policies (public read, system write)
CREATE POLICY "Tool scores are viewable by everyone" ON tool_scores FOR SELECT USING (true);
CREATE POLICY "Tool scores are insertable by authenticated users" ON tool_scores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Tool scores are updatable by authenticated users" ON tool_scores FOR UPDATE USING (auth.role() = 'authenticated');

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_scores_updated_at BEFORE UPDATE ON tool_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial categories
INSERT INTO categories (name, description, color_theme) VALUES
('Animation & Graphics', 'Tools for creating animations, graphics, and visual effects', 'purple'),
('AI & Machine Learning', 'Artificial intelligence and machine learning development tools', 'blue'),
('No-Code/Low-Code', 'Visual development platforms and no-code solutions', 'green'),
('Web Development', 'Frontend and backend web development frameworks and tools', 'orange'),
('Mobile Development', 'Tools for building mobile applications', 'red'),
('DevOps & Infrastructure', 'Deployment, monitoring, and infrastructure management tools', 'gray'),
('Database & Storage', 'Database management and data storage solutions', 'yellow'),
('Testing & QA', 'Testing frameworks and quality assurance tools', 'pink'),
('Design & Prototyping', 'UI/UX design and prototyping tools', 'indigo'),
('Analytics & Monitoring', 'Application monitoring and analytics platforms', 'teal');

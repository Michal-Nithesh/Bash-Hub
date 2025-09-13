import React, { useState } from 'react';
import { Search, Filter, ShoppingCart, Heart, Star, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';

// Mock store data
const mockProducts = [
  {
    id: 1,
    title: 'Data Structures and Algorithms in Java',
    description: 'Complete textbook with solved examples. Excellent condition.',
    price: 450,
    originalPrice: 650,
    seller: 'Alice Smith',
    college: 'GEC Thiruvananthapuram',
    rating: 4.8,
    images: ['📚'],
    category: 'Books',
    condition: 'Like New',
    available: true
  },
  {
    id: 2,
    title: 'Yamaha Acoustic Guitar F310',
    description: 'Well-maintained acoustic guitar, perfect for beginners. Comes with picks and strap.',
    price: 8500,
    originalPrice: 12000,
    seller: 'Bob Johnson',
    college: 'LBS College of Engineering',
    rating: 4.6,
    images: ['🎸'],
    category: 'Instruments',
    condition: 'Good',
    available: true
  },
  {
    id: 3,
    title: 'Computer Networks - Tanenbaum',
    description: '5th Edition. Highlighted and bookmarked. Great for networking concepts.',
    price: 380,
    originalPrice: 520,
    seller: 'Carol Davis',
    college: 'College of Engineering, Trivandrum',
    rating: 4.7,
    images: ['📖'],
    category: 'Books',
    condition: 'Good',
    available: true
  },
  {
    id: 4,
    title: 'Scientific Calculator Casio fx-991ES',
    description: 'Programmable calculator in excellent working condition.',
    price: 1200,
    originalPrice: 1800,
    seller: 'David Wilson',
    college: 'Noorul Islam Centre',
    rating: 4.9,
    images: ['🧮'],
    category: 'Electronics',
    condition: 'Like New',
    available: false
  },
  {
    id: 5,
    title: 'Digital Electronics Lab Manual',
    description: 'Complete lab manual with circuit diagrams and procedures.',
    price: 150,
    originalPrice: 250,
    seller: 'Emma Brown',
    college: 'Francis Xavier Engineering',
    rating: 4.5,
    images: ['📋'],
    category: 'Books',
    condition: 'Good',
    available: true
  },
  {
    id: 6,
    title: 'HP Pavilion Laptop Bag',
    description: 'Padded laptop bag suitable for 15.6 inch laptops. Water resistant.',
    price: 800,
    originalPrice: 1200,
    seller: 'Frank Miller',
    college: 'GEC Thiruvananthapuram',
    rating: 4.4,
    images: ['💼'],
    category: 'Accessories',
    condition: 'Like New',
    available: true
  }
];

export const Store: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredProducts = mockProducts
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return b.id - a.id; // newest first
      }
    });

  const categories = ['Books', 'Instruments', 'Electronics', 'Accessories'];

  const handleRequestPurchase = (productId: number) => {
    // TODO: Implement purchase request functionality
    console.log('Purchase request for product:', productId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🛍️ Student Store</h1>
          <p className="text-muted-foreground">Find great deals on books, instruments, and study materials from fellow students</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select onValueChange={setCategoryFilter} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSortBy} defaultValue="newest">
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-4xl mb-2">{product.images[0]}</div>
                    <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <Badge variant="secondary">{product.condition}</Badge>
                  <Badge variant={product.available ? "default" : "secondary"}>
                    {product.available ? "Available" : "Sold"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
                    <span className="text-sm text-green-600 font-medium">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{product.seller}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{product.college}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                <Button 
                  className="w-full" 
                  disabled={!product.available}
                  onClick={() => handleRequestPurchase(product.id)}
                >
                  {product.available ? (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Request to Buy
                    </>
                  ) : (
                    'Sold Out'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or browse different categories</p>
          </div>
        )}

        {/* Sell CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-2">Have something to sell?</h3>
          <p className="text-muted-foreground mb-4">List your books, instruments, and study materials for free</p>
          <Button variant="hero" size="lg">
            Start Selling
          </Button>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Heart, Star, User, MapPin, Plus, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  seller_name?: string;
  seller_college?: string;
  category: string;
  condition: string;
  images: string[];
  available: boolean;
  created_at: string;
  contact_method?: string;
}

export const Store: React.FC = () => {
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showSellModal, setShowSellModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Sell product form state
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    condition: '',
    images: [] as File[],
    contactMethod: ''
  });

  const categories = ['Books', 'Instruments', 'Electronics', 'Accessories', 'Lab Equipment', 'Sports', 'Furniture', 'Stationery'];
  const conditions = ['Brand New', 'Like New', 'Good', 'Fair', 'Poor'];

  useEffect(() => {
    fetchProducts();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('products_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProducts(prev => [payload.new as Product, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(product => 
            product.id === payload.new.id ? payload.new as Product : product
          ));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(product => product.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
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
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest first
      }
    });

  const handleRequestPurchase = (productId: string) => {
    // TODO: Implement purchase request functionality
    console.log('Purchase request for product:', productId);
  };

  const handleSellFormChange = (field: string, value: string) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles]
      }));
    }
  };

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const imageUrls: string[] = [];
    
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrls.push(data.publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    return imageUrls;
  };

  const handleSubmitProduct = async () => {
    // Validate form
    if (!productForm.title || !productForm.description || !productForm.price || 
        !productForm.category || !productForm.condition) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user) {
      alert('Please login to list a product');
      return;
    }

    setSubmitting(true);
    
    try {
      // Upload images if any
      let imageUrls: string[] = [];
      if (productForm.images.length > 0) {
        imageUrls = await uploadImages(productForm.images);
      }

      // Get user profile for seller info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, college_name')
        .eq('id', user.id)
        .single();

      // Insert product into database
      const { error } = await supabase
        .from('products')
        .insert({
          title: productForm.title,
          description: productForm.description,
          price: parseFloat(productForm.price),
          original_price: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
          category: productForm.category,
          condition: productForm.condition,
          seller_id: user.id,
          seller_name: profile?.full_name || 'Anonymous',
          seller_college: profile?.college_name || 'Unknown College',
          contact_method: productForm.contactMethod,
          images: imageUrls,
          available: true
        });

      if (error) {
        console.error('Error inserting product:', error);
        alert('Error listing product. Please try again.');
        return;
      }

      // Reset form and close modal
      setProductForm({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        condition: '',
        images: [],
        contactMethod: ''
      });
      setShowSellModal(false);
      
      alert('Product listed successfully!');
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Error listing product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} onLogout={signOut} />
      
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
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {product.images && product.images.length > 0 ? (
                        <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 mb-4 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
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
                    <Badge variant="secondary">{product.condition}</Badge>
                    <Badge variant={product.available ? "default" : "secondary"}>
                      {product.available ? "Available" : "Sold"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                      {product.original_price && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">₹{product.original_price}</span>
                          <span className="text-sm text-green-600 font-medium">
                            {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{product.seller_name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{product.seller_college || 'Unknown College'}</span>
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
        )}

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
          <Button 
            variant="hero" 
            size="lg"
            onClick={() => setShowSellModal(true)}
          >
            Start Selling
          </Button>
        </div>

        {/* Sell Product Modal */}
        <Dialog open={showSellModal} onOpenChange={setShowSellModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">List Your Product</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Product Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Data Structures and Algorithms Textbook"
                  value={productForm.title}
                  onChange={(e) => handleSellFormChange('title', e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => handleSellFormChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product's condition, features, and any included accessories..."
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => handleSellFormChange('description', e.target.value)}
                />
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select onValueChange={(value) => handleSellFormChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="1200"
                    value={productForm.price}
                    onChange={(e) => handleSellFormChange('price', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    placeholder="1800"
                    value={productForm.originalPrice}
                    onChange={(e) => handleSellFormChange('originalPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    PNG, JPG, GIF up to 10MB
                  </div>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    Choose Files
                  </Button>
                </div>
                
                {/* Display selected images */}
                {productForm.images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {productForm.images.map((file, index) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                          <span className="text-sm">{file.name}</span>
                          <button
                            onClick={() => removeImage(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Method */}
              <div className="space-y-2">
                <Label htmlFor="contact">Preferred Contact Method</Label>
                <Input
                  id="contact"
                  placeholder="e.g., WhatsApp: +91 9876543210 or Email: user@example.com"
                  value={productForm.contactMethod}
                  onChange={(e) => handleSellFormChange('contactMethod', e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowSellModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSubmitProduct}
                  disabled={submitting}
                >
                  {submitting ? 'Listing Product...' : 'List Product'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
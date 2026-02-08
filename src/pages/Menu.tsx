import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import { getAvailableMenuItems, getPopularItems, getItemsByDay } from '@/db/api';
import type { MenuItemWithSession, CartItem, DayOfWeek, PopularMenuItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getCurrentDate, isAvailableOnDay } from '@/lib/date-utils';

const DAYS_OF_WEEK: { value: DayOfWeek | 'all'; label: string }[] = [
  { value: 'all', label: 'All Days' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItemWithSession[]>([]);
  const [popularItems, setPopularItems] = useState<PopularMenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadMenuItems();
    loadPopularItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, selectedSession, selectedDay, menuItems]);

  const loadMenuItems = async () => {
    setLoading(true);
    const items = await getAvailableMenuItems();
    setMenuItems(items);
    setLoading(false);
  };

  const loadPopularItems = async () => {
    const items = await getPopularItems(6);
    setPopularItems(items);
  };

  const filterItems = () => {
    let filtered = [...menuItems];

    // Filter by day
    if (selectedDay !== 'all') {
      filtered = filtered.filter(item => 
        item.available_days && item.available_days.includes(selectedDay)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedSession !== 'all') {
      filtered = filtered.filter(item => item.menu_sessions?.session_type === selectedSession);
    }

    setFilteredItems(filtered);
  };

  const addToCart = (item: MenuItemWithSession) => {
    const cart = localStorage.getItem('cart');
    const cartItems: CartItem[] = cart ? JSON.parse(cart) : [];

    const existingItem = cartItems.find(ci => ci.menuItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({ menuItem: item, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));

    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart`,
    });
  };

  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  const sessions = Array.from(new Set(menuItems.map(item => item.menu_sessions?.session_type).filter(Boolean)));

  const isItemPopular = (itemId: string) => {
    return popularItems.some(pi => pi.id === itemId);
  };

  const getItemPopularityRank = (itemId: string) => {
    const item = popularItems.find(pi => pi.id === itemId);
    return item?.popularity_rank;
  };

  const formatAvailableDays = (days: DayOfWeek[] | null) => {
    if (!days || days.length === 0) return 'All days';
    if (days.length === 7) return 'All days';
    return days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-muted-foreground">Browse and order your favorite meals</p>
        </div>

        {/* Popular Items Section */}
        {popularItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Popular Items</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularItems.map((item) => (
                <Card key={item.id} className="overflow-hidden border-primary/20">
                  <div className="relative">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <Badge className="absolute top-2 right-2 bg-primary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      #{item.popularity_rank} Popular
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">₹{item.price}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.total_orders} orders
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatAvailableDays(item.available_days)}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full"
                      onClick={() => addToCart(item as unknown as MenuItemWithSession)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Day Selector */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Filter by Day</h3>
          </div>
          <Tabs value={selectedDay} onValueChange={(value) => setSelectedDay(value as DayOfWeek | 'all')}>
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
              {DAYS_OF_WEEK.map((day) => (
                <TabsTrigger key={day.value} value={day.value} className="flex-shrink-0">
                  {day.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger>
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {sessions.map(session => (
                <SelectItem key={session} value={session || ''}>{session}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full bg-muted" />
                <CardContent className="pt-4">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-full mb-2 bg-muted" />
                  <Skeleton className="h-4 w-2/3 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No menu items found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden bg-muted">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Badge>{item.category}</Badge>
                    {isItemPopular(item.id) && (
                      <Badge className="bg-primary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description || 'Delicious meal prepared fresh'}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-primary">₹{item.price}</span>
                    <Badge variant="outline">{item.menu_sessions?.name}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatAvailableDays(item.available_days)}</span>
                  </div>
                  {item.stock <= 10 && item.stock > 0 && (
                    <p className="text-xs text-warning mt-2">Only {item.stock} left!</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => addToCart(item)}
                    disabled={item.stock === 0}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Cart Button */}
        <div className="fixed bottom-6 right-6">
          <Button size="lg" asChild className="rounded-full shadow-lg">
            <Link to="/cart">
              <ShoppingCart className="mr-2 h-5 w-5" />
              View Cart
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}

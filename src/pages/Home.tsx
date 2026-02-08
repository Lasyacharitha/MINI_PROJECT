import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed, Clock, ShoppingCart, CheckCircle } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import { getAvailableMenuItems } from '@/db/api';
import type { MenuItemWithSession } from '@/types';
import { getCurrentDate, isAvailableOnDay } from '@/lib/date-utils';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState<MenuItemWithSession[]>([]);

  useEffect(() => {
    loadFeaturedItems();
  }, []);

  const loadFeaturedItems = async () => {
    const items = await getAvailableMenuItems();
    const today = getCurrentDate();
    const availableToday = items.filter(item => isAvailableOnDay(item.available_days, today));
    setFeaturedItems(availableToday.slice(0, 4));
  };

  const features = [
    {
      icon: UtensilsCrossed,
      title: 'Fresh & Delicious',
      description: 'Quality meals prepared daily with fresh ingredients',
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Pre-order and skip the queue during busy hours',
    },
    {
      icon: ShoppingCart,
      title: 'Easy Ordering',
      description: 'Browse menu, customize, and order in just a few clicks',
    },
    {
      icon: CheckCircle,
      title: 'Secure Pickup',
      description: 'QR code verification ensures your order is ready',
    },
  ];

  const sessions = [
    {
      name: 'Breakfast',
      time: '7:00 AM - 10:00 AM',
      image: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_65ce9f9b-8cac-4c6a-bf94-f5aa9437fb89.jpg',
    },
    {
      name: 'Lunch',
      time: '12:00 PM - 3:00 PM',
      image: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_44570bb9-8d94-42d4-a2d9-273ec821a7a7.jpg',
    },
    {
      name: 'Snacks',
      time: '4:00 PM - 6:00 PM',
      image: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_9f4667d6-bbd7-414f-9c3f-92de252866ca.jpg',
    },
    {
      name: 'Dinner',
      time: '7:00 PM - 10:00 PM',
      image: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f2d4428e-961d-439c-b588-79c73944221b.jpg',
    },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Pre-order Your <span className="gradient-text">Favorite Meals</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Skip the queue and enjoy fresh, delicious food from SRIT Canteen. Order now and pick up at your convenience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link to="/menu">
                      <UtensilsCrossed className="mr-2 h-5 w-5" />
                      Browse Menu
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0b76ffff-d1cf-4ef5-a9ed-f9ed78f7f481.jpg"
                  alt="SRIT Canteen"
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SRIT Canteen?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience hassle-free meal ordering with our convenient pre-order system
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="border-none shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Items Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Today's Featured Items</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Delicious meals available for pre-order today
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">₹{item.price}</span>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild size="lg">
                <Link to="/menu">View Full Menu</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Sessions Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meal Sessions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Order from our diverse menu throughout the day
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sessions.map((session) => (
                <Card key={session.name} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={session.image}
                      alt={session.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold text-xl">{session.name}</h3>
                      <p className="text-sm">{session.time}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join hundreds of students and staff who save time every day with our pre-order system
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/menu">Start Ordering Now</Link>
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

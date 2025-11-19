import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Heart,
  Star,
  ShoppingCart,
  Bell,
  MagnifyingGlass,
  ChatCircle,
  ThumbsUp,
  Share,
  Play,
  Download,
  DotsThree,
  User,
  Check,
  TrendUp,
  TrendDown,
  Calendar,
  Clock,
} from '@phosphor-icons/react';
import type { ExtractedColor } from '@/lib/types';
import type { ThemeConfig } from '@/lib/themeConfig';
import { 
  getShadowClass, 
  getBorderClass,
  getRadiusClass,
} from '@/lib/themeConfig';

interface EnhancedPreviewComponentsProps {
  colors: ExtractedColor[];
  isDark?: boolean;
  config: ThemeConfig;
}

export function EnhancedPreviewComponents({ colors, isDark = false, config }: EnhancedPreviewComponentsProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const c = (index: number) => colors[index % colors.length]?.hex || '#6366f1';

  const cardClassName = config.useGlass
    ? `bg-card/10 backdrop-blur-xl ${getBorderClass(config.borders)} border-border/20`
    : `bg-card ${getBorderClass(config.borders)} border-border`;

  return (
    <div className="space-y-6">
      {/* Social Media Card */}
      <Card className={`p-6 space-y-4 ${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}>
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12" style={{ backgroundColor: c(0) }}>
            <div className="w-full h-full flex items-center justify-center text-white font-semibold">
              JD
            </div>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">Jane Doe</h4>
              <Badge style={{ backgroundColor: c(0), color: 'white' }} className="text-xs">
                Pro
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">2 hours ago</p>
          </div>
          <Button variant="ghost" size="icon">
            <DotsThree size={20} weight="bold" />
          </Button>
        </div>

        <p className="text-foreground">
          Just discovered this amazing color palette! The harmony between these colors is perfect for my next design project. 🎨✨
        </p>

        <div className="rounded-lg overflow-hidden border">
          <div className="h-48 flex">
            {colors.slice(0, 5).map((color, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: color.hex }} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setLiked(!liked)}
            >
              <Heart size={20} weight={liked ? 'fill' : 'regular'} style={{ color: liked ? c(0) : undefined }} />
              <span>248</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <ChatCircle size={20} weight="regular" />
              <span>32</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share size={20} weight="regular" />
              <span>15</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setBookmarked(!bookmarked)}
          >
            <Star size={20} weight={bookmarked ? 'fill' : 'regular'} style={{ color: bookmarked ? c(1) : undefined }} />
          </Button>
        </div>

        <Separator />

        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8" style={{ backgroundColor: c(2) }}>
            <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
              ME
            </div>
          </Avatar>
          <Input placeholder="Add a comment..." className="flex-1" />
          <Button size="sm" style={{ backgroundColor: c(0), color: 'white' }}>
            Post
          </Button>
        </div>
      </Card>

      {/* E-commerce Product Card with Hover States */}
      <div className="grid md:grid-cols-2 gap-4">
        {colors.slice(0, 2).map((color, i) => (
          <Card key={i} className={`overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow ${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}>
            <div className="relative h-48" style={{ backgroundColor: color.hex }}>
              <div className="absolute top-3 left-3">
                <Badge className="bg-background/90 text-foreground">New</Badge>
              </div>
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Heart size={18} />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full">
                  <MagnifyingGlass size={18} />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <Button className="w-full" style={{ backgroundColor: c(i + 2), color: 'white' }}>
                  Quick View
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Premium Product</h4>
                  <p className="text-sm text-muted-foreground">Category Name</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: c(i) }}>
                    $199
                  </div>
                  <div className="text-xs text-muted-foreground line-through">$299</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} weight="fill" style={{ color: c(1) }} />
                ))}
                <span className="text-xs text-muted-foreground ml-1">(128)</span>
              </div>
              <Button className="w-full" style={{ backgroundColor: c(i), color: 'white' }}>
                <ShoppingCart size={18} weight="bold" className="mr-2" />
                Add to Cart
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Notification Center */}
      <Card className={`p-6 space-y-4 ${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={24} weight="bold" style={{ color: c(0) }} />
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
            <Badge style={{ backgroundColor: c(0), color: 'white' }}>3</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Enable</span>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {[
            { icon: Heart, text: 'Sarah liked your post', time: '5m ago', color: c(0), unread: true },
            { icon: ChatCircle, text: 'New message from Alex', time: '12m ago', color: c(1), unread: true },
            { icon: Star, text: 'Your project got 50 stars!', time: '1h ago', color: c(2), unread: true },
            { icon: User, text: 'John started following you', time: '2h ago', color: c(3), unread: false },
          ].map((notif, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer ${
                notif.unread ? 'bg-accent/30' : ''
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${notif.color}20` }}
              >
                <notif.icon size={20} weight="bold" style={{ color: notif.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{notif.text}</p>
                <p className="text-xs text-muted-foreground">{notif.time}</p>
              </div>
              {notif.unread && (
                <div
                  className="w-2 h-2 rounded-full mt-2"
                  style={{ backgroundColor: c(0) }}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Analytics Dashboard */}
      <Card className={`p-6 space-y-4 ${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Performance</h3>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: '$12.5k', change: '+12.5%', trend: 'up', color: c(0) },
            { label: 'Users', value: '3.2k', change: '+8.2%', trend: 'up', color: c(1) },
            { label: 'Orders', value: '428', change: '-2.4%', trend: 'down', color: c(2) },
            { label: 'Conversion', value: '4.8%', change: '+1.2%', trend: 'up', color: c(3) },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-lg border space-y-2 ${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                {stat.trend === 'up' ? (
                  <TrendUp size={16} style={{ color: c(4) }} />
                ) : (
                  <TrendDown size={16} style={{ color: c(5) }} />
                )}
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1">
                <span
                  className="text-xs font-medium"
                  style={{ color: stat.trend === 'up' ? c(4) : c(5) }}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Recent Activity</h4>
          {[
            { label: 'Website Traffic', value: 75, color: c(0) },
            { label: 'Social Engagement', value: 60, color: c(1) },
            { label: 'Email Campaign', value: 85, color: c(2) },
            { label: 'Mobile App', value: 45, color: c(3) },
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{item.label}</span>
                <span className="font-medium" style={{ color: item.color }}>
                  {item.value}%
                </span>
              </div>
              <Progress value={item.value} className="h-2" style={{ '--progress-color': item.color } as React.CSSProperties} />
            </div>
          ))}
        </div>
      </Card>

      {/* Video Player Card */}
      <Card className={`overflow-hidden ${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}>
        <div className="relative h-64 bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${c(0)}, ${c(1)})` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="icon"
              className="w-16 h-16 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
            >
              <Play size={32} weight="fill" style={{ color: c(0) }} />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center gap-2 text-white text-sm">
              <Clock size={16} />
              <span>12:34</span>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10" style={{ backgroundColor: c(0) }}>
              <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                CH
              </div>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">
                Amazing Color Theory Tutorial
              </h4>
              <p className="text-sm text-muted-foreground">Channel Name • 1.2M views • 2 days ago</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            Learn the fundamentals of color theory and how to create harmonious color palettes
            for your design projects. This comprehensive guide covers everything you need to know.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="default" style={{ backgroundColor: c(0), color: 'white' }}>
              <ThumbsUp size={18} className="mr-2" />
              2.5K
            </Button>
            <Button variant="outline">
              <Download size={18} className="mr-2" />
              Save
            </Button>
            <Button variant="outline">
              <Share size={18} className="mr-2" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      {/* Task List */}
      <Card className={`p-6 space-y-4 ${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Today's Tasks</h3>
          <Button size="sm" style={{ backgroundColor: c(0), color: 'white' }}>
            Add Task
          </Button>
        </div>

        <div className="space-y-2">
          {[
            { task: 'Review design system', completed: true, priority: 'high' },
            { task: 'Update color palette', completed: true, priority: 'medium' },
            { task: 'Client presentation', completed: false, priority: 'high' },
            { task: 'Team meeting notes', completed: false, priority: 'low' },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors ${
                item.completed ? 'opacity-60' : ''
              }`}
            >
              <Checkbox checked={item.completed} style={{ borderColor: c(i % colors.length) }} />
              <div className="flex-1">
                <p className={`text-sm text-foreground ${item.completed ? 'line-through' : ''}`}>
                  {item.task}
                </p>
              </div>
              <Badge
                variant={item.priority === 'high' ? 'default' : 'secondary'}
                style={
                  item.priority === 'high'
                    ? { backgroundColor: c(5), color: 'white' }
                    : item.priority === 'medium'
                    ? { backgroundColor: c(1), color: 'white' }
                    : undefined
                }
              >
                {item.priority}
              </Badge>
              <Button variant="ghost" size="icon">
                <DotsThree size={20} />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Calendar Event */}
      <Card className={`p-6 space-y-4 ${cardClassName} ${getRadiusClass(config.radius)} ${getShadowClass(config.shadows)}`}>
        <div className="flex items-center gap-2">
          <Calendar size={24} weight="bold" style={{ color: c(0) }} />
          <h3 className="text-lg font-semibold text-foreground">Upcoming Events</h3>
        </div>

        {colors.slice(0, 3).map((color, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg" style={{ backgroundColor: `${color.hex}20` }}>
              <div className="text-xs text-muted-foreground">DEC</div>
              <div className="text-xl font-bold" style={{ color: color.hex }}>
                {15 + i}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-foreground">Design Workshop</h4>
              <p className="text-sm text-muted-foreground">10:00 AM - 12:00 PM</p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[0, 1, 2].map((j) => (
                    <div
                      key={j}
                      className="w-6 h-6 rounded-full border-2 border-background"
                      style={{ backgroundColor: c((i + j) % colors.length) }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">+5 attending</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Join
            </Button>
          </div>
        ))}
      </Card>
    </div>
  );
}

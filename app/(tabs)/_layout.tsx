import { Tabs, usePathname, useRouter } from 'expo-router';
import { Home, BookOpen, TrendingUp, CheckSquare, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedBottomNav, { AnimatedNavItem } from '@/components/AnimatedBottomNav';
import { useEffect, useState } from 'react';

const tabRoutes = [
  { route: '/', name: 'index', title: 'Home', icon: Home },
  { route: '/steps', name: 'steps', title: 'Steps', icon: BookOpen },
  { route: '/journey', name: 'journey', title: 'Journey', icon: TrendingUp },
  { route: '/tasks', name: 'tasks', title: 'Tasks', icon: CheckSquare },
  { route: '/profile', name: 'profile', title: 'Profile', icon: User },
];

export default function TabLayout() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const index = tabRoutes.findIndex(
      (tab) => pathname === tab.route || pathname.startsWith(`/${tab.name}`)
    );
    if (index !== -1 && index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [pathname, activeIndex]);

  const navItems: AnimatedNavItem[] = tabRoutes.map((tab, index) => ({
    label: tab.title,
    icon: tab.icon,
    onPress: () => {
      router.push(tab.route as any);
    },
  }));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={() => (
        <AnimatedBottomNav
          items={navItems}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          accentColor={theme.primary}
        />
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="steps" />
      <Tabs.Screen name="journey" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

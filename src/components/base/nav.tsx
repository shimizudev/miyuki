"use client";
import {
  Home,
  Bookmark,
  Calendar,
  Grid3X3,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ModeToggle } from "./theme-swticher";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface SidebarNavigationProps {
  activeNav: string;
}

export function SidebarNavigation({ activeNav }: SidebarNavigationProps) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "browse", icon: Grid3X3, label: "Browse", path: "/browse" },
    { id: "mylist", icon: Bookmark, label: "My List", path: "/my-list" },
    {
      id: "simulcasts",
      icon: Calendar,
      label: "Simulcasts",
      path: "/simulcasts",
    },
  ];

  const userItems = [
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
    { id: "logout", icon: LogOut, label: "Sign Out", path: "/logout" },
  ];

  return (
    <motion.aside
      className="bg-card border-border relative flex w-16 flex-col overflow-hidden border-r"
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="from-primary/5 to-accent/5 absolute inset-0 bg-gradient-to-b via-transparent"
        animate={{
          background: [
            "linear-gradient(to bottom, rgba(var(--primary), 0.05), transparent, rgba(var(--accent), 0.05))",
            "linear-gradient(to bottom, rgba(var(--accent), 0.05), transparent, rgba(var(--primary), 0.05))",
            "linear-gradient(to bottom, rgba(var(--primary), 0.05), transparent, rgba(var(--accent), 0.05))",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="border-border relative z-10 flex items-center justify-center border-b p-3"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.a
          href="/"
          className="bg-primary relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg"
          whileHover={{ rotateY: 180 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.span
            className="text-primary-foreground text-sm font-bold"
            initial={{ rotateY: 0 }}
            whileHover={{ rotateY: 180 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            A
          </motion.span>
        </motion.a>
      </motion.div>

      <nav className="relative z-10 flex-1 p-2">
        <div className="relative space-y-2">
          <AnimatePresence>
            {(hoveredNav || activeNav) && (
              <motion.div
                className="bg-primary/20 absolute h-12 w-12 rounded-lg"
                layoutId="navBackground"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y:
                    navItems.findIndex(
                      (item) => item.id === (hoveredNav || activeNav),
                    ) * 56,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  duration: 0.3,
                }}
              />
            )}
          </AnimatePresence>

          {navItems.map((item, index) => (
            <Tooltip delayDuration={0.1} key={item.id}>
              <motion.div
                className="group relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <TooltipTrigger>
                  <motion.a
                    href={item.path}
                    className={`relative z-10 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg ${
                      activeNav === item.id
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onMouseEnter={() => setHoveredNav(item.id)}
                    onMouseLeave={() => setHoveredNav(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      className="relative z-10"
                      animate={{
                        scale: activeNav === item.id ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <item.icon className="h-5 w-5" />
                    </motion.div>
                  </motion.a>
                </TooltipTrigger>
                <TooltipContent sideOffset={5} side="right">
                  {item.label}
                </TooltipContent>
              </motion.div>
            </Tooltip>
          ))}
        </div>
      </nav>

      <motion.div
        className="border-border relative z-10 border-t p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <div className="space-y-2">
          {userItems.map((item, index) => (
            <Tooltip delayDuration={0.1} key={item.id}>
              <motion.div
                className="group relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              >
                <TooltipTrigger>
                  <motion.a
                    href={item.path}
                    className="text-muted-foreground hover:text-foreground relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      className="bg-muted absolute inset-0 rounded-lg opacity-0"
                      whileHover={{ opacity: 0.5 }}
                      transition={{ duration: 0.2 }}
                    />

                    <motion.div className="relative z-10">
                      <item.icon className="h-5 w-5" />
                    </motion.div>
                  </motion.a>
                </TooltipTrigger>

                <TooltipContent sideOffset={5} side="right">
                  {item.label}
                </TooltipContent>
              </motion.div>
            </Tooltip>
          ))}

          <Tooltip delayDuration={0.1}>
            <motion.div
              className="group relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <TooltipTrigger asChild>
                <motion.div
                  className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="bg-muted absolute inset-0 rounded-lg opacity-0"
                    whileHover={{ opacity: 0.5 }}
                    transition={{ duration: 0.2 }}
                  />

                  <motion.div className="relative z-10">
                    <ModeToggle />
                  </motion.div>
                </motion.div>
              </TooltipTrigger>

              <TooltipContent sideOffset={5} side="right">
                Theme
              </TooltipContent>
            </motion.div>
          </Tooltip>
        </div>
      </motion.div>
    </motion.aside>
  );
}

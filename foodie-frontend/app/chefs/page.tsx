"use client";

import { motion } from "framer-motion";
import ChefCard from '@/components/ChefCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Chef, getChefs } from '@/services/chef.service';
import { useEffect, useState } from "react";
import { mockChefs } from '@/lib/api';

export default function ChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChefs = async () => {
      setLoading(true);
      try {
        const response = await getChefs();
        if (response.data && response.data.length > 0) {
          setChefs(response.data);
        } else {
          setChefs(mockChefs);
        }
      } catch (err) {
        setChefs(mockChefs);
      } finally {
        setLoading(false);
      }
    };
    fetchChefs();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <section className="relative pt-32 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Talent You Can <span className="text-accent italic">Taste</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
            Behind every dish is someone betting on themselves. Our chefs come from everywhere, carrying ideas, heritage, and obsession with craft.
          </p>
        </motion.div>
      </section>

      {/* Chefs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {chefs.map((chef, index) => (
              <motion.div
                key={chef.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ChefCard chef={chef} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

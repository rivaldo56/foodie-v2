import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    category: z.enum(['vegetable', 'fruit', 'spice', 'meat', 'dairy', 'grain', 'other']),
    description: z.string().optional(),
    price_per_unit: z.coerce.number().min(0, 'Price must be positive'),
    unit: z.enum(['kg', 'g', 'bunch', 'piece', 'liter', 'box']),
    quantity_available: z.coerce.number().min(0, 'Quantity must be positive'),
    image: z.string().url('Invalid image URL').optional().or(z.literal('')),
    is_available: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;

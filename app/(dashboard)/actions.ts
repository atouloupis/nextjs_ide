'use server';

import { deleteProductById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteProduct(formData: FormData) {
  let id = Number(formData.get('id'));
  console.log('Deleting product with id:', id); 
  await deleteProductById(id);
  revalidatePath('/');
}

// scripts/importBeaches.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function importBeaches() {
  try {
    const dataPath = path.join(__dirname, '../data_forDB_pretty.json'); // Pastikan ini mengarah ke file Anda
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const beaches = JSON.parse(jsonData);

    console.log(`Starting import of ${beaches.length} beaches...`);

    let importedCount = 0;
    for (const beachData of beaches) {
      // Ambil featured_image langsung dari data JSON
      // Jika beachData.featured_image sudah berupa array, langsung pakai.
      // Jika mungkin null/undefined, defaultkan ke array kosong.
      const featuredImagesArray: string[] = Array.isArray(beachData.featured_image)
        ? beachData.featured_image.filter((url: any) => typeof url === 'string') // Pastikan isinya string
        : [];

      try {
        await prisma.beach.upsert({
          where: { place_Id: beachData.place_id },
          update: {
            place_name: beachData.place_name,
            description: beachData.description === '-' ? null : beachData.description,
            reviews: beachData.reviews ||  0,
            rating: beachData.rating || 0.0,
            featured_image: featuredImagesArray, // <--- LANGSUNG GUNAKAN ARRAY DARI JSON
            address: beachData.address,
            review_keywords: beachData.review_keywords,
            link: beachData.link,
            coordinates: beachData.coordinates,
          },
create: {
            place_Id: beachData.place_id,
            place_name: beachData.place_name,
            description: beachData.description === '-' ? null : beachData.description,
            reviews: beachData.reviews || 0,
            rating: beachData.rating || 0.0,
            featured_image: featuredImagesArray, // <--- LANGSUNG GUNAKAN ARRAY DARI JSON
            address: beachData.address,
            review_keywords: beachData.review_keywords,
            link: beachData.link,
            coordinates: beachData.coordinates,
          },
        });
        importedCount++;
        if (importedCount % 100 === 0) {
          console.log(`Imported ${importedCount} beaches...`);
        }
      } catch (error: any) {
        console.error(`Error importing beach ${beachData.place_id || 'unknown'}:`, error.message);
      }
    }

    console.log(`Successfully imported/updated ${importedCount} beaches.`);
  } catch (error) {
    console.error("Error during beach data import:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importBeaches();
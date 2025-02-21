import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers() {
  try {
    console.log('Seeding users...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
          ON CONFLICT (id) DO NOTHING;
        `;
      }),
    );

    console.log('Users seeded successfully');
    return insertedUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedInvoices() {
  try {
    console.log('Seeding invoices...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customer_id UUID NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL
      );
    `;

    const insertedInvoices = await Promise.all(
      invoices.map(
        (invoice) => sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
          ON CONFLICT (id) DO NOTHING;
        `,
      ),
    );

    console.log('Invoices seeded successfully');
    return insertedInvoices;
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedCustomers() {
  try {
    console.log('Seeding customers...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `;

    const insertedCustomers = await Promise.all(
      customers.map(
        (customer) => sql`
          INSERT INTO customers (id, name, email, image_url)
          VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
          ON CONFLICT (id) DO NOTHING;
        `,
      ),
    );

    console.log('Customers seeded successfully');
    return insertedCustomers;
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function seedRevenue() {
  try {
    console.log('Seeding revenue...');
    await sql`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `;

    const values = revenue.map(
      (rev) => [rev.month, rev.revenue]
    );

    await sql`
      INSERT INTO revenue (month, revenue)
      VALUES ${sql(values)}
      ON CONFLICT (month) DO NOTHING;
    `;

    console.log('Revenue seeded successfully');
    return revenue;
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

export async function GET() {
  try {
    console.log('Starting database seeding...');
    const result = await sql.begin(async (sql) => {
      await seedUsers();
      await seedCustomers();
      await seedInvoices();
      await seedRevenue();
    });

    console.log('Database seeded successfully');
    return new Response(JSON.stringify({ message: 'Database seeded successfully' }), { status: 200 });
  } catch (error) {
    console.error('Seeding Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

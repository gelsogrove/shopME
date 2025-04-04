-- Create Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Product_Categories junction table
CREATE TABLE product_categories (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Insert Categories
INSERT INTO categories (name) VALUES
('Pasta'),
('Cheese'),
('Oil'),
('Condiments'),
('Cured Meats'),
('DOP'),
('IGP'),
('DOCG'),
('Vegetables'),
('Wine'),
('Nuts'),
('Spirits');

-- Insert Products
INSERT INTO products (name, description, price, quantity, status) VALUES
('Parmigiano Reggiano DOP 24 months', 'Authentic Parmigiano Reggiano DOP aged 24 months...', 29.99, 25, 'active'),
('Gragnano IGP Pasta - Spaghetti', 'Traditional spaghetti from Gragnano...', 4.99, 120, 'active'),
('Tuscan IGP Extra Virgin Olive Oil', 'Premium extra virgin olive oil from Tuscany...', 19.99, 48, 'active'),
('Prosciutto di Parma DOP 24 months', 'Fine Parma ham aged for 24 months...', 24.99, 15, 'active'),
('Aceto Balsamico di Modena IGP', 'Traditional balsamic vinegar of Modena IGP...', 14.99, 30, 'active'),
('Mozzarella di Bufala Campana DOP', 'Fresh buffalo mozzarella DOP from Campania...', 9.99, 40, 'active'),
('San Marzano DOP Tomatoes', 'Authentic San Marzano tomatoes...', 6.99, 85, 'active'),
('Barolo DOCG Wine', 'Premium Barolo DOCG wine from Piedmont...', 49.99, 24, 'active'),
('Pistacchi di Bronte DOP', 'Vibrant green pistachios from Bronte...', 18.99, 35, 'active'),
('Limoncello di Sorrento IGP', 'Traditional lemon liqueur...', 22.99, 42, 'active');

-- Link Products with Categories
WITH product_category_links (product_name, category_names) AS (
    VALUES 
    ('Parmigiano Reggiano DOP 24 months', ARRAY['Cheese', 'DOP']),
    ('Gragnano IGP Pasta - Spaghetti', ARRAY['Pasta', 'IGP']),
    ('Tuscan IGP Extra Virgin Olive Oil', ARRAY['Oil', 'IGP']),
    ('Prosciutto di Parma DOP 24 months', ARRAY['Cured Meats', 'DOP']),
    ('Aceto Balsamico di Modena IGP', ARRAY['Condiments', 'IGP']),
    ('Mozzarella di Bufala Campana DOP', ARRAY['Cheese', 'DOP']),
    ('San Marzano DOP Tomatoes', ARRAY['Vegetables', 'DOP']),
    ('Barolo DOCG Wine', ARRAY['Wine', 'DOCG']),
    ('Pistacchi di Bronte DOP', ARRAY['Nuts', 'DOP']),
    ('Limoncello di Sorrento IGP', ARRAY['Spirits', 'IGP'])
)
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM product_category_links pcl
JOIN products p ON p.name = pcl.product_name
CROSS JOIN UNNEST(pcl.category_names) AS category_name
JOIN categories c ON c.name = category_name;

-- Create Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Order_Items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample orders
INSERT INTO orders (customer_name, customer_email, status, payment_method, payment_status, total_amount) VALUES
('John Doe', 'john@example.com', 'completed', 'credit_card', 'paid', 299.99),
('Jane Smith', 'jane@example.com', 'processing', 'paypal', 'paid', 199.99);

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
SELECT 1, id, 1, price
FROM products
WHERE name IN ('Parmigiano Reggiano DOP 24 months', 'Barolo DOCG Wine')
UNION ALL
SELECT 2, id, 2, price
FROM products
WHERE name IN ('Mozzarella di Bufala Campana DOP', 'Limoncello di Sorrento IGP');

-- Create indexes for better performance
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id); 
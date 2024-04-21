-- Create users table
CREATE TABLE public.users
(
    user_id SERIAL NOT NULL,
    password character varying(200),
    email character varying(100) UNIQUE NOT NULL,
    fullname character varying(100) NOT NULL,
    username character varying(50) UNIQUE NOT NULL,
    google_id character varying(100) UNIQUE,
    roles character varying(10)[] DEFAULT '{customer}'::character varying[] NOT NULL,
    address character varying(200),
    city character varying(100),
    state character varying(100),
    country character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
    
);

-- Add unique indexes for email and username
CREATE UNIQUE INDEX users_unique_lower_email_idx
    ON public.users (lower(email));

CREATE UNIQUE INDEX users_unique_lower_username_idx
    ON public.users (lower(username));

-- Create a cart table
CREATE TABLE public.cart
(
    id SERIAL NOT NULL,
    user_id integer UNIQUE NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES public.users (user_id)
        ON DELETE SET NULL
);

-- Create a product_category table
CREATE TABLE public.product_category
(
    id SERIAL NOT NULL,
    name character varying(50) NOT NULL,
    PRIMARY KEY (id)
);

-- Create a material_type table
CREATE TABLE public.material_type
(
    id SERIAL NOT NULL,
    gold_price real,
    silver_price real,
    name character varying(50) NOT NULL,
    PRIMARY KEY (id)
);

-- Create a products table with category and material type
CREATE TABLE public.products
(
    product_id SERIAL NOT NULL,
    name character varying(50) NOT NULL,
    price real NOT NULL,
    description text NOT NULL,
    image_url character varying,
    category_id integer,
    material_id integer,
    weight real,
    making_charge real,
    PRIMARY KEY (product_id),
    FOREIGN KEY (category_id)
        REFERENCES public.product_category (id)
        ON DELETE SET NULL,
    FOREIGN KEY (material_id)
        REFERENCES public.material_type (id)
        ON DELETE SET NULL
);

-- Create a cart_item table
CREATE TABLE public.cart_item
(
    id SERIAL NOT NULL,
    cart_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (id),
    UNIQUE (cart_id, product_id),
    FOREIGN KEY (cart_id)
        REFERENCES public.cart (id)
        ON DELETE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES public.products (product_id)
        ON DELETE SET NULL
);

-- Create a wishlist table
CREATE TABLE public.wishlist
(
    id SERIAL NOT NULL,
    user_id integer NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES public.users (user_id)
        ON DELETE CASCADE
);

-- Create a wishlist_item table
CREATE TABLE public.wishlist_item
(
    id SERIAL NOT NULL,
    wishlist_id integer NOT NULL,
    product_id integer NOT NULL,
    cart_id integer,
    PRIMARY KEY (id),
    FOREIGN KEY (wishlist_id)
        REFERENCES public.wishlist (id)
        ON DELETE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES public.products (product_id)
        ON DELETE SET NULL,
    FOREIGN KEY (cart_id)
        REFERENCES public.cart (id)
        ON DELETE SET NULL,
    CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
);

-- Create an orders table
CREATE TABLE public.orders
(
    order_id SERIAL NOT NULL,
    user_id integer NOT NULL,
    status character varying(20) NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_DATE NOT NULL,
    amount real,
    total integer,
    ref character varying(100),
    payment_method character varying,
    PRIMARY KEY (order_id),
    FOREIGN KEY (user_id)
        REFERENCES public.users (user_id)
        ON DELETE CASCADE
);

-- Create the order_item table
CREATE TABLE public.order_item
(
    id SERIAL NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (order_id)
        REFERENCES public.orders (order_id)
        ON DELETE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES public.products (product_id)
        ON DELETE SET NULL
);

-- Create a reviews table
CREATE TABLE public.reviews
(
    id SERIAL NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    rating integer NOT NULL,
    product_id integer NOT NULL,
    date date NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (product_id)
        REFERENCES public.products (product_id)
        ON DELETE SET NULL,
    FOREIGN KEY (user_id)
        REFERENCES public.users (user_id)
        ON DELETE SET NULL
);

-- Create the resetTokens table
CREATE TABLE public."resetTokens"
(
    id SERIAL NOT NULL,
    email character varying NOT NULL,
    token character varying NOT NULL,
    used boolean DEFAULT false NOT NULL,
    expiration timestamp without time zone,
    PRIMARY KEY (id)
);

-- Create the comparison_list table
CREATE TABLE public.comparison_list
(
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id)
        REFERENCES public.users (user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES public.products (product_id)
        ON DELETE CASCADE
);

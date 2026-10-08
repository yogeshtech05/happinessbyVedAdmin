import bcrypt from "bcryptjs";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from "@/config/permissions";

export async function seedDatabase(db: any) {
  try {
    // Check if seeded already
    const check = await db.query("SELECT COUNT(*) as count FROM admin_users;");
    const count = parseInt(check.rows?.[0]?.count || check[0]?.count || "0", 10);
    if (count > 0) {
      return;
    }

    console.log("Seeding initial database...");

    const now = new Date().toISOString();
    const defaultPasswordHash = bcrypt.hashSync("Admin@123456", 10);

    // 1. Roles
    const rolesData = [
      {
        id: "role-super-admin",
        name: "Super Admin",
        description: "Full system access with user and role management privileges",
        isSystem: true,
        permissions: JSON.stringify(DEFAULT_ROLE_PERMISSIONS["Super Admin"]),
      },
      {
        id: "role-admin",
        name: "Admin",
        description: "Operational admin access for daily store management",
        isSystem: true,
        permissions: JSON.stringify(DEFAULT_ROLE_PERMISSIONS["Admin"]),
      },
      {
        id: "role-manager",
        name: "Manager",
        description: "Managerial access for orders, catalog, and reports",
        isSystem: true,
        permissions: JSON.stringify(DEFAULT_ROLE_PERMISSIONS["Manager"]),
      },
      {
        id: "role-staff",
        name: "Staff",
        description: "Staff presenter access for viewing and updating deliveries",
        isSystem: true,
        permissions: JSON.stringify(DEFAULT_ROLE_PERMISSIONS["Staff"]),
      },
    ];

    for (const r of rolesData) {
      await db.query(
        `INSERT INTO roles (id, name, description, is_system, permissions, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [r.id, r.name, r.description, r.isSystem, r.permissions]
      );
    }

    // 2. Admin Users
    const adminsData = [
      {
        id: "admin-super-01",
        name: "Vedant Sharma",
        email: "admin@happinessdeliver.com",
        passwordHash: defaultPasswordHash,
        roleId: "role-super-admin",
        roleName: "Super Admin",
        status: "ACTIVE",
      },
      {
        id: "admin-mgr-01",
        name: "Priya Malhotra",
        email: "priya@happinessdeliver.com",
        passwordHash: defaultPasswordHash,
        roleId: "role-manager",
        roleName: "Manager",
        status: "ACTIVE",
      },
      {
        id: "admin-staff-01",
        name: "Ananya Roy (Presenter Lead)",
        email: "ananya@happinessdeliver.com",
        passwordHash: defaultPasswordHash,
        roleId: "role-staff",
        roleName: "Staff",
        status: "ACTIVE",
      },
      {
        id: "admin-staff-02",
        name: "Sneha Patel (Presenter)",
        email: "sneha@happinessdeliver.com",
        passwordHash: defaultPasswordHash,
        roleId: "role-staff",
        roleName: "Staff",
        status: "ACTIVE",
      },
    ];

    for (const u of adminsData) {
      await db.query(
        `INSERT INTO admin_users (id, name, email, password_hash, role_id, role_name, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING;`,
        [u.id, u.name, u.email, u.passwordHash, u.roleId, u.roleName, u.status]
      );
    }

    // 3. Customers
    const customersData = [
      {
        id: "cust-101",
        name: "Rohan Kapoor",
        email: "rohan.k@example.com",
        phone: "+91 98201 54321",
        status: "ACTIVE",
        totalOrders: 3,
        totalSpent: 4897.00,
        city: "Mumbai",
        address: "Flat 402, Sea Breeze Heights, Bandra West",
        pincode: "400050",
      },
      {
        id: "cust-102",
        name: "Aarti Sengupta",
        email: "aarti.s@example.com",
        phone: "+91 99304 88219",
        status: "ACTIVE",
        totalOrders: 2,
        totalSpent: 3998.00,
        city: "Delhi",
        address: "House 12, Gulmohar Park, South Extension",
        pincode: "110049",
      },
      {
        id: "cust-103",
        name: "Vikramaditya Verma",
        email: "vikram.v@example.com",
        phone: "+91 97112 00492",
        status: "ACTIVE",
        totalOrders: 1,
        totalSpent: 2999.00,
        city: "Bengaluru",
        address: "Villa 8, Palm Meadows, Whitefield",
        pincode: "560066",
      },
      {
        id: "cust-104",
        name: "Kavita Reddy",
        email: "kavita.reddy@example.com",
        phone: "+91 98480 12345",
        status: "ACTIVE",
        totalOrders: 4,
        totalSpent: 7596.00,
        city: "Hyderabad",
        address: "Plot 45, Jubilee Hills Checkpost",
        pincode: "500033",
      },
      {
        id: "cust-105",
        name: "Siddharth Mehta",
        email: "sid.m@example.com",
        phone: "+91 98920 11982",
        status: "ACTIVE",
        totalOrders: 1,
        totalSpent: 1499.00,
        city: "Mumbai",
        address: "A-201, Oberoi Woods, Goregaon East",
        pincode: "400063",
      },
    ];

    for (const c of customersData) {
      await db.query(
        `INSERT INTO customers (id, name, email, phone, status, total_orders, total_spent, city, address, pincode, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [c.id, c.name, c.email, c.phone, c.status, c.totalOrders, c.totalSpent, c.city, c.address, c.pincode]
      );
    }

    // 4. Categories
    const categoriesData = [
      {
        id: "cat-birthday",
        name: "Milestone Celebration",
        slug: "milestone-celebration",
        tagline: "Heartfelt birthday surprises delivered with love and music",
        icon: "Cake",
        packageCount: 5,
        gradient: "from-pink-500 to-rose-500",
        accentColor: "#ec4899",
      },
      {
        id: "cat-anniversary",
        name: "Romantic Expressions",
        slug: "romantic-expressions",
        tagline: "Unforgettable candlelit & doorstep romantic surprise setups",
        icon: "Heart",
        packageCount: 4,
        gradient: "from-red-500 to-pink-600",
        accentColor: "#e11d48",
      },
      {
        id: "cat-parents",
        name: "Family Homage",
        slug: "family-homage",
        tagline: "Honoring parents with dignified respect and emotional tributes",
        icon: "Users",
        packageCount: 3,
        gradient: "from-amber-500 to-amber-700",
        accentColor: "#d97706",
      },
      {
        id: "cat-festivals",
        name: "Festive Joy",
        slug: "festive-joy",
        tagline: "Grand festive surprise hampers with sweet traditions",
        icon: "Sparkles",
        packageCount: 3,
        gradient: "from-purple-500 to-indigo-600",
        accentColor: "#9333ea",
      },
    ];

    for (const cat of categoriesData) {
      await db.query(
        `INSERT INTO categories (id, name, slug, tagline, icon, package_count, gradient, accent_color, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [cat.id, cat.name, cat.slug, cat.tagline, cat.icon, cat.packageCount, cat.gradient, cat.accentColor]
      );
    }

    // 5. Packages
    const packagesData = [
      {
        id: "pkg-birthday-surprise",
        slug: "birthday-surprise",
        title: "Birthday Surprise",
        name: "Birthday Surprise Package",
        occasion: "birthday",
        occasionLabel: "Birthday",
        category: "Milestone Celebration",
        tagline: "Turn birthdays into extraordinary memories of joy and warmth",
        price: 1499.00,
        originalPrice: 1999.00,
        compareAtPrice: 1999.00,
        rating: 4.9,
        reviewCount: 128,
        popular: true,
        featured: true,
        isFeatured: true,
        isActive: true,
        badge: "Bestseller",
        shortDescription: "A complete heartwarming birthday surprise complete with customized cake, flowers, and a female surprise presenter.",
        description: "Make birthdays truly unforgettable! Our signature Birthday Surprise package brings heartfelt joy right to your loved one's door. A charming female surprise presenter will deliver a designer cake, fresh rose bouquet, and personalized gift hamper while playing their favorite birthday song.",
        highlights: JSON.stringify([
          "Dedicated Female Surprise Presenter",
          "Handcrafted Fresh Cream Birthday Cake (0.5 kg)",
          "Premium Red Rose & Lily Bouquet",
          "Personalized Handcrafted Greeting Scroll",
          "Party Popper & Celebration Music Experience",
        ]),
        inclusions: JSON.stringify([
          "Customized Birthday Cake with customized message",
          "Fresh Flower Arrangement (12 Red Roses)",
          "Female Surprise Presenter to orchestrate the moment",
          "Personalized Handwritten Emotional Scroll Card",
          "Confetti Blast & Party Accessories",
        ]),
        features: JSON.stringify([
          { title: "Female Host Doorstep Delivery", included: true },
          { title: "Handwritten Memory Scroll", included: true },
          { title: "Custom Eggless Cake Option", included: true },
          { title: "HD Photography Addon Available", included: true },
        ]),
        addons: JSON.stringify([
          { id: "addon-photo-video", name: "HD Photography & Video Highlights", price: 999, description: "Professional capture of the genuine surprise reactions." },
          { id: "addon-balloon-decor", name: "Helium Balloon Arch Setup", price: 799, description: "20 premium metallic balloons setup at doorstep." },
        ]),
        duration: "30 - 45 Minutes Experience",
        imageTheme: "pink",
        visualIcon: "Cake",
        image: "/surprises/birthday.png",
      },
      {
        id: "pkg-parents-special",
        slug: "parents-special",
        title: "Parents Special",
        name: "Parents Special Experience",
        occasion: "parents",
        occasionLabel: "For Parents",
        category: "Family Homage",
        tagline: "Honoring their selfless love with dignity, luxury, and tears of happiness",
        price: 1999.00,
        originalPrice: 2499.00,
        compareAtPrice: 2499.00,
        rating: 5.0,
        reviewCount: 94,
        popular: true,
        featured: true,
        isFeatured: true,
        isActive: true,
        badge: "Most Emotional",
        shortDescription: "An emotionally rich surprise experience designed to show deep gratitude and respect for parents on birthdays or anniversaries.",
        description: "Parents spend their lives giving. Give them a moment they will treasure forever. Our Parents Special package includes a solemn doorstep homage, custom memory card, premium sugar-free or classic artisanal cake, traditional flower garland or bouquet, and a female surprise presenter.",
        highlights: JSON.stringify([
          "Empathetic Female Surprise Presenter",
          "Artisanal Cake / Luxury Indian Sweet Box",
          "Exquisite Orchid & Carnation Bouquet",
          "Framed 'Thank You Mom & Dad' Letter",
          "Custom Keepsake Memory Box",
        ]),
        inclusions: JSON.stringify([
          "Artisanal Cake or Gourmet Dry Fruit Box",
          "Fresh Flower Garland & Bouquet",
          "Female Surprise Presenter to deliver homage",
          "Framed Memory Scroll with personalized message",
        ]),
        features: JSON.stringify([
          { title: "Senior-friendly gentle presentation", included: true },
          { title: "Custom message reading", included: true },
          { title: "Sugar-free cake customization", included: true },
        ]),
        addons: JSON.stringify([
          { id: "addon-photo-video", name: "HD Photography & Video Highlights", price: 999, description: "Capture precious parent reactions." },
        ]),
        duration: "45 Minutes Experience",
        imageTheme: "gold",
        visualIcon: "HeartHandshake",
        image: "/surprises/parents.png",
      },
      {
        id: "pkg-romantic-sunset",
        slug: "romantic-sunset",
        title: "Romantic Sunset Surprise",
        name: "Romantic Sunset Experience",
        occasion: "romantic",
        occasionLabel: "Romantic",
        category: "Romantic Expressions",
        tagline: "Ignite passion with a fairy-lit surprise experience",
        price: 2999.00,
        originalPrice: 3500.00,
        compareAtPrice: 3500.00,
        rating: 4.9,
        reviewCount: 110,
        popular: true,
        featured: true,
        isFeatured: true,
        isActive: true,
        badge: "Premium Romantic",
        shortDescription: "Fairy light pathway, red velvet cake, 50 red roses, and violin background score.",
        description: "Transform an ordinary evening into an enchanting fairy tale. Designed for couples celebrating anniversaries, proposals, or romantic milestones.",
        highlights: JSON.stringify([
          "50 Premium Red Roses Bouquet",
          "Red Velvet Designer Heart Cake",
          "Fairy Lights & Candlelit Entrance Setup",
          "Female Surprise Presenter with Golden Envelope",
        ]),
        inclusions: JSON.stringify([
          "50 Dutch Red Roses Arrangement",
          "1 kg Red Velvet Heart Cake",
          "Fairy Light Entrance Arch",
          "Female Surprise Host with Romantic Music",
        ]),
        features: JSON.stringify([
          { title: "Fairy Lights & Candles Setup", included: true },
          { title: "Live Musician Addon Available", included: true },
        ]),
        addons: JSON.stringify([
          { id: "addon-violinist", name: "Live Violinist / Acoustic Performance", price: 1499, description: "Live performance of romantic songs." },
        ]),
        duration: "60 Minutes Experience",
        imageTheme: "rose",
        visualIcon: "Heart",
        image: "/surprises/romantic.png",
      },
    ];

    for (const p of packagesData) {
      await db.query(
        `INSERT INTO packages (id, slug, title, name, occasion, occasion_label, category, tagline, price, original_price, compare_at_price, rating, review_count, popular, featured, is_featured, is_active, badge, short_description, description, highlights, inclusions, features, addons, duration, image_theme, visual_icon, image, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [
          p.id, p.slug, p.title, p.name, p.occasion, p.occasionLabel, p.category, p.tagline, p.price, p.originalPrice, p.compareAtPrice, p.rating, p.reviewCount, p.popular, p.featured, p.isFeatured, p.isActive, p.badge, p.shortDescription, p.description, p.highlights, p.inclusions, p.features, p.addons, p.duration, p.imageTheme, p.visualIcon, p.image
        ]
      );
    }

    // 6. Products / Inventory
    const productsData = [
      {
        id: "prod-cake-choc",
        name: "Belgian Truffle Chocolate Cake (0.5 kg)",
        category: "Cakes",
        price: 599.00,
        costPrice: 280.00,
        sku: "CK-CHOC-05",
        stockQuantity: 45,
        isAvailable: true,
        description: "Rich dark Belgian chocolate truffle cake handcrafted daily.",
      },
      {
        id: "prod-cake-rv",
        name: "Heart Red Velvet Cream Cheese Cake (1 kg)",
        category: "Cakes",
        price: 999.00,
        costPrice: 450.00,
        sku: "CK-RV-10",
        stockQuantity: 30,
        isAvailable: true,
        description: "Layered red velvet with real cream cheese frosting.",
      },
      {
        id: "prod-flower-rose12",
        name: "Dutch Red Roses Bouquet (12 Stems)",
        category: "Flowers",
        price: 499.00,
        costPrice: 200.00,
        sku: "FL-ROSE-12",
        stockQuantity: 100,
        isAvailable: true,
        description: "Long-stemmed fresh Dutch red roses with eucalyptus leaves.",
      },
      {
        id: "prod-flower-lily",
        name: "Oriental Pink Lily & Rose Luxury Box",
        category: "Flowers",
        price: 1199.00,
        costPrice: 500.00,
        sku: "FL-LILY-BOX",
        stockQuantity: 25,
        isAvailable: true,
        description: "Handpicked fragrance lilies presented in a plush velvet box.",
      },
      {
        id: "prod-addon-photo",
        name: "HD Reaction Video & Photo Highlights Package",
        category: "Photography",
        price: 999.00,
        costPrice: 400.00,
        sku: "SERV-PHOTO-HD",
        stockQuantity: 999,
        isAvailable: true,
        description: "Professional coverage of the surprise moment with edited reel.",
      },
      {
        id: "prod-addon-presenter",
        name: "Premium Female Surprise Presenter Service",
        category: "Presenters",
        price: 799.00,
        costPrice: 350.00,
        sku: "SERV-PRES-FEM",
        stockQuantity: 50,
        isAvailable: true,
        description: "Charming female presenter orchestrating songs, scroll read, and cake cutting.",
      },
    ];

    for (const pr of productsData) {
      await db.query(
        `INSERT INTO products (id, name, category, price, cost_price, sku, stock_quantity, is_available, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [pr.id, pr.name, pr.category, pr.price, pr.costPrice, pr.sku, pr.stockQuantity, pr.isAvailable, pr.description]
      );
    }

    // 7. Orders & Deliveries
    const ordersData = [
      {
        id: "ord-8001",
        orderNumber: "HD-2026-8001",
        customerId: "cust-101",
        customerName: "Rohan Kapoor",
        customerEmail: "rohan.k@example.com",
        customerPhone: "+91 98201 54321",
        recipientName: "Simran Kapoor",
        recipientPhone: "+91 98201 99988",
        deliveryAddress: "Flat 402, Sea Breeze Heights, Bandra West",
        city: "Mumbai",
        pincode: "400050",
        landmark: "Near Carter Road Promenade",
        deliveryDate: "2026-10-10",
        deliveryTimeSlot: "19:00 - 20:00 (Sunset Slot)",
        occasion: "birthday",
        presenterRequired: true,
        presenterNote: "Please play 'Tum Se Hi' when opening the surprise box!",
        specialInstructions: "Ring bell twice, keep candles ready.",
        items: JSON.stringify([
          {
            packageId: "pkg-birthday-surprise",
            title: "Birthday Surprise",
            slug: "birthday-surprise",
            price: 1499.00,
            quantity: 1,
            selectedAddons: [{ id: "addon-photo-video", name: "HD Photography & Video Highlights", price: 999 }],
            customMessage: "Happy 25th Birthday my love! Wishing you a world of joy.",
            recipientName: "Simran Kapoor",
            totalPrice: 2498.00,
          },
        ]),
        subtotal: 1499.00,
        addonsTotal: 999.00,
        deliveryFee: 0.00,
        discountAmount: 0.00,
        totalAmount: 2498.00,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentMethod: "Razorpay (UPI)",
        assignedStaffId: "admin-staff-01",
        assignedStaffName: "Ananya Roy (Presenter Lead)",
        internalNotes: "Customer verified via phone. Surprise presenter confirmed.",
        timeline: JSON.stringify([
          { id: "tl-1", status: "PENDING", note: "Order placed by customer", updatedBy: "System", timestamp: now },
          { id: "tl-2", status: "CONFIRMED", note: "Payment verified ₹2,498 via Razorpay", updatedBy: "System", timestamp: now },
        ]),
      },
      {
        id: "ord-8002",
        orderNumber: "HD-2026-8002",
        customerId: "cust-102",
        customerName: "Aarti Sengupta",
        customerEmail: "aarti.s@example.com",
        customerPhone: "+91 99304 88219",
        recipientName: "Mr. & Mrs. Sengupta",
        recipientPhone: "+91 99304 11002",
        deliveryAddress: "House 12, Gulmohar Park, South Extension",
        city: "Delhi",
        pincode: "110049",
        landmark: "Opposite Community Centre",
        deliveryDate: "2026-10-08",
        deliveryTimeSlot: "11:00 - 12:00 (Morning Slot)",
        occasion: "parents",
        presenterRequired: true,
        presenterNote: "Read the tribute letter slowly with emotion.",
        specialInstructions: "Eggless cake required, low sugar.",
        items: JSON.stringify([
          {
            packageId: "pkg-parents-special",
            title: "Parents Special",
            slug: "parents-special",
            price: 1999.00,
            quantity: 1,
            selectedAddons: [],
            customMessage: "Thank you Mom and Dad for everything you do.",
            recipientName: "Mr. & Mrs. Sengupta",
            totalPrice: 1999.00,
          },
        ]),
        subtotal: 1999.00,
        addonsTotal: 0.00,
        deliveryFee: 0.00,
        discountAmount: 0.00,
        totalAmount: 1999.00,
        status: "OUT_FOR_DELIVERY",
        paymentStatus: "PAID",
        paymentMethod: "Razorpay (Card)",
        assignedStaffId: "admin-staff-02",
        assignedStaffName: "Sneha Patel (Presenter)",
        internalNotes: "Presenter out with fresh flower bouquet.",
        timeline: JSON.stringify([
          { id: "tl-10", status: "PENDING", note: "Order created", updatedBy: "System", timestamp: now },
          { id: "tl-11", status: "CONFIRMED", note: "Order confirmed", updatedBy: "Priya Malhotra", timestamp: now },
          { id: "tl-12", status: "PREPARING", note: "Baking cake & fresh florals packed", updatedBy: "Vedant Sharma", timestamp: now },
          { id: "tl-13", status: "OUT_FOR_DELIVERY", note: "Presenter Sneha Patel departed for venue", updatedBy: "Sneha Patel", timestamp: now },
        ]),
      },
      {
        id: "ord-8003",
        orderNumber: "HD-2026-8003",
        customerId: "cust-104",
        customerName: "Kavita Reddy",
        customerEmail: "kavita.reddy@example.com",
        customerPhone: "+91 98480 12345",
        recipientName: "Arjun Reddy",
        recipientPhone: "+91 98480 99887",
        deliveryAddress: "Plot 45, Jubilee Hills Checkpost",
        city: "Hyderabad",
        pincode: "500033",
        landmark: "Behind Peddamma Temple",
        deliveryDate: "2026-10-09",
        deliveryTimeSlot: "20:00 - 21:00 (Night Slot)",
        occasion: "romantic",
        presenterRequired: true,
        presenterNote: "Live violinist performance included.",
        specialInstructions: "Prepare fairy light entrance.",
        items: JSON.stringify([
          {
            packageId: "pkg-romantic-sunset",
            title: "Romantic Sunset Surprise",
            slug: "romantic-sunset",
            price: 2999.00,
            quantity: 1,
            selectedAddons: [{ id: "addon-violinist", name: "Live Musician Performance", price: 1499 }],
            customMessage: "Happy 5th Anniversary my soulmate!",
            recipientName: "Arjun Reddy",
            totalPrice: 4498.00,
          },
        ]),
        subtotal: 2999.00,
        addonsTotal: 1499.00,
        deliveryFee: 0.00,
        discountAmount: 200.00,
        totalAmount: 4298.00,
        status: "PREPARING",
        paymentStatus: "PAID",
        paymentMethod: "Razorpay (NetBanking)",
        assignedStaffId: "admin-staff-01",
        assignedStaffName: "Ananya Roy (Presenter Lead)",
        internalNotes: "Violinist booked for 8:15 PM slot.",
        timeline: JSON.stringify([
          { id: "tl-20", status: "PENDING", note: "Order placed", updatedBy: "System", timestamp: now },
          { id: "tl-21", status: "CONFIRMED", note: "Coupon FESTIVE200 applied", updatedBy: "System", timestamp: now },
          { id: "tl-22", status: "PREPARING", note: "Roses sourced, cake under preparation", updatedBy: "Priya Malhotra", timestamp: now },
        ]),
      },
    ];

    for (const o of ordersData) {
      await db.query(
        `INSERT INTO orders (id, order_number, customer_id, customer_name, customer_email, customer_phone, recipient_name, recipient_phone, delivery_address, city, pincode, landmark, delivery_date, delivery_time_slot, occasion, presenter_required, presenter_note, special_instructions, items, subtotal, addons_total, delivery_fee, discount_amount, total_amount, status, payment_status, payment_method, assigned_staff_id, assigned_staff_name, internal_notes, timeline, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [
          o.id, o.orderNumber, o.customerId, o.customerName, o.customerEmail, o.customerPhone, o.recipientName, o.recipientPhone, o.deliveryAddress, o.city, o.pincode, o.landmark, o.deliveryDate, o.deliveryTimeSlot, o.occasion, o.presenterRequired, o.presenterNote, o.specialInstructions, o.items, o.subtotal, o.addonsTotal, o.deliveryFee, o.discountAmount, o.totalAmount, o.status, o.paymentStatus, o.paymentMethod, o.assignedStaffId, o.assignedStaffName, o.internalNotes, o.timeline
        ]
      );

      // Create delivery record
      const delStatus = o.status === "OUT_FOR_DELIVERY" ? "OUT_FOR_DELIVERY" : (o.assignedStaffId ? "ASSIGNED" : "UNASSIGNED");
      await db.query(
        `INSERT INTO deliveries (id, order_id, order_number, customer_name, customer_phone, recipient_name, recipient_phone, delivery_address, city, pincode, delivery_date, delivery_time_slot, assigned_presenter_id, assigned_presenter_name, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [
          `del-${o.id}`, o.id, o.orderNumber, o.customerName, o.customerPhone, o.recipientName, o.recipientPhone, o.deliveryAddress, o.city, o.pincode, o.deliveryDate, o.deliveryTimeSlot, o.assignedStaffId, o.assignedStaffName, delStatus, o.specialInstructions
        ]
      );
    }

    // 8. Coupons
    const couponsData = [
      {
        id: "cup-101",
        code: "WELCOME100",
        description: "Flat ₹100 discount for first-time surprise bookings",
        discountType: "FIXED",
        discountValue: 100.00,
        minOrderValue: 999.00,
        maxDiscountAmount: 100.00,
        usageLimit: 500,
        usageCount: 42,
        startDate: "2026-01-01",
        expiryDate: "2026-12-31",
        isActive: true,
      },
      {
        id: "cup-102",
        code: "FESTIVE200",
        description: "₹200 OFF on orders above ₹2,500",
        discountType: "FIXED",
        discountValue: 200.00,
        minOrderValue: 2500.00,
        maxDiscountAmount: 200.00,
        usageLimit: 200,
        usageCount: 18,
        startDate: "2026-10-01",
        expiryDate: "2026-11-15",
        isActive: true,
      },
    ];

    for (const cp of couponsData) {
      await db.query(
        `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, usage_count, start_date, expiry_date, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [cp.id, cp.code, cp.description, cp.discountType, cp.discountValue, cp.minOrderValue, cp.maxDiscountAmount, cp.usageLimit, cp.usageCount, cp.startDate, cp.expiryDate, cp.isActive]
      );
    }

    // 9. Reviews
    const reviewsData = [
      {
        id: "rev-1",
        orderId: "ord-8001",
        packageId: "pkg-birthday-surprise",
        packageName: "Birthday Surprise",
        customerName: "Rohan Kapoor",
        customerEmail: "rohan.k@example.com",
        rating: 5,
        title: "Tears of pure happiness!",
        comment: "The presenter was incredibly polite and sang so beautifully. My wife was completely surprised! 100% recommended Happiness Deliver.",
        status: "APPROVED",
        isFeatured: true,
      },
      {
        id: "rev-2",
        orderId: "ord-8002",
        packageId: "pkg-parents-special",
        packageName: "Parents Special",
        customerName: "Aarti Sengupta",
        customerEmail: "aarti.s@example.com",
        rating: 5,
        title: "Unforgettable memory for my parents",
        comment: "The framed scroll and flower garland touched my parents' heart deeply. Outstanding delivery and presentation quality.",
        status: "APPROVED",
        isFeatured: true,
      },
    ];

    for (const rv of reviewsData) {
      await db.query(
        `INSERT INTO reviews (id, order_id, package_id, package_name, customer_name, customer_email, rating, title, comment, status, is_featured, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [rv.id, rv.orderId, rv.packageId, rv.packageName, rv.customerName, rv.customerEmail, rv.rating, rv.title, rv.comment, rv.status, rv.isFeatured]
      );
    }

    // 10. CMS Content
    const cmsData = [
      {
        id: "cms-hero",
        sectionKey: "homepage_hero",
        title: "Unforgettable Doorstep Surprises & Joyful Celebrations",
        subtitle: "Customized cakes, fresh flowers, and female surprise presenters to make every milestone emotional.",
        content: "Happiness Deliver brings luxury doorstep surprise presentations to your loved ones.",
        imageUrl: "/surprises/hero_banner.png",
        updatedBy: "Vedant Sharma",
      },
      {
        id: "cms-about",
        sectionKey: "about_section",
        title: "Creating Extraordinary Moments of Emotional Connection",
        subtitle: "India's premier surprise delivery platform with dedicated presenter hosts.",
        content: "We curate premium cakes, long-stem roses, acoustic music, and personalized letters delivered by trained female surprise hosts.",
        updatedBy: "Vedant Sharma",
      },
    ];

    for (const cms of cmsData) {
      await db.query(
        `INSERT INTO cms_content (id, section_key, title, subtitle, content, image_url, updated_by, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id) DO NOTHING;`,
        [cms.id, cms.sectionKey, cms.title, cms.subtitle, cms.content, cms.imageUrl, cms.updatedBy]
      );
    }

    // 11. Store Settings
    await db.query(
      `INSERT INTO store_settings (id, business_name, brand_tagline, helpline_phone, helpline_email, address, city, state, pincode, currency_symbol, tax_rate_percent, default_delivery_fee, free_delivery_threshold, order_prefix, allow_same_day_booking, booking_cutoff_time, auto_assign_presenters, updated_at)
       VALUES ('main', 'Happiness Deliver', 'Premium Surprise Gifting & Doorstep Delivery', '+91 98765 43210', 'hello@happinessdeliver.com', '100 Executive Boulevard, Suite 400', 'Mumbai', 'Maharashtra', '400001', '₹', 18.00, 0.00, 1000.00, 'HD-', TRUE, '18:00', FALSE, NOW())
       ON CONFLICT (id) DO NOTHING;`
    );

    // 12. Initial Audit Log
    await db.query(
      `INSERT INTO activity_logs (id, admin_id, admin_name, admin_email, action, entity_type, entity_id, details, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW());`,
      [
        "log-init-01",
        "admin-super-01",
        "Vedant Sharma",
        "admin@happinessdeliver.com",
        "System Initialized",
        "System",
        "sys-01",
        "Happiness Deliver Admin Panel backend tables and seed schema initialized.",
        "127.0.0.1",
      ]
    );

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

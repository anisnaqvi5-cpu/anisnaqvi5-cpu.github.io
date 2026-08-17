# Wellness E-commerce App — UI/UX Specification

> Reference: `ARCHITECTURE.md` (technical architecture)। یہ document اسی architecture پر مبنی مکمل **screen-by-screen UI/UX spec** ہے — design-only، implementation ابھی شروع نہیں کی گئی۔

---

## 0. Design Language (ہر screen اسی system پر بنے گی)

**Aesthetic:** Calm، premium، minimal — clutter-free wellness brand feel (Calm/Headspace جیسا مزاج + boutique e-commerce کی polish)۔

| Token | Value / Direction |
|---|---|
| **Color palette** | Neutral base: warm off-white/cream (`#FAF7F2`) background، charcoal (`#1F2420`) text۔ Primary accent: sage green (`#7A9471`)۔ Secondary accent: warm terracotta/clay (`#C97C5D`) for CTAs/highlights۔ Success/error: muted, desaturated tones (کوئی harsh neon نہیں) |
| **Typography** | Headings: warm humanist serif (جیسے Fraunces/Lora) — premium/organic feel۔ Body/UI: clean sans (Inter/Satoshi)۔ Urdu content کے لیے Noto Nastaliq Urdu fallback |
| **Spacing** | 8px grid، generous whitespace، breathing room ہر card/section کے گرد |
| **Corners** | Soft rounded — 16px cards، 24px sheets/modals، pill buttons (999px) |
| **Elevation** | Flat design + subtle soft shadows (کوئی heavy drop-shadow نہیں)؛ borders کم، whitespace زیادہ separation کا کام کرے |
| **Motion** | Subtle، calm — 200–300ms ease-out transitions؛ کوئی aggressive bounce/parallax نہیں (wellness context میں motion "کم اور نرم" ہو) |
| **Iconography** | Consistent line icons (Lucide/Phosphor style)، 1.5px stroke |
| **Imagery** | Natural light product photography، minimal props، warm tones |
| **Grid** | Mobile-first: 4-column mobile, 8-column tablet, 12-column desktop |
| **Accessibility** | WCAG AA contrast minimum، min 44×44px tap targets، dynamic type support |

**Global patterns used across screens:**
- **Bottom Tab Bar (mobile)**: Home · Shop · Wellness · Cart · Profile
- **Skeleton loaders** (نہ کہ spinners) ہر data-heavy screen پر — premium feel کے لیے
- **Toast notifications** (top, auto-dismiss) غیر-blocking actions کے لیے؛ **inline banners** blocking/critical errors کے لیے
- **Pull-to-refresh** mobile lists پر

---

# PART A — Onboarding & Authentication

## 1. Splash Screen
- **Purpose:** Brand entry moment؛ app initialize/session-check ہوتے وقت calm first impression دینا۔
- **Components:** Logo (centered، subtle fade-in animation)، background gradient (cream→sage soft blend)، tagline (اختیاری)۔
- **User Actions:** کوئی نہیں (auto-advance، max 1.5–2s)۔
- **Navigation:** Auto-route → session موجود ہو تو Home، نہ ہو تو Onboarding (first-launch) یا Login (returning user)۔
- **Empty State:** N/A۔
- **Loading State:** خود یہی screen loading state ہے؛ session-check + critical config fetch یہاں ہوتا ہے۔
- **Error State:** Network fail → retry button کے ساتھ minimal error screen ("Connection نہیں ہو رہا، دوبارہ کوشش کریں")۔
- **Mobile Responsive:** Full-screen، status bar transparent/matched to bg۔

## 2. Onboarding (3–4 slides)
- **Purpose:** Value proposition پہنچانا — "صرف store نہیں، آپ کا wellness ecosystem"۔ Slides: (1) Personalized products (2) Live customization (3) Wellness tracking (4) Community/plans۔
- **Components:** Swipeable illustration carousel، progress dots، "Skip" (top-right)، "Next"/"Get Started" CTA (bottom)۔
- **User Actions:** Swipe/tap next، skip to auth۔
- **Navigation:** Skip یا last slide "Get Started" → Sign Up/Login screen۔
- **Empty State:** N/A۔
- **Loading State:** N/A (static local assets)۔
- **Error State:** N/A۔
- **Mobile Responsive:** Full-bleed illustration، safe-area aware bottom CTA۔ Tablet/desktop پر centered max-width card layout۔

## 3. Sign Up / Login
- **Purpose:** Account creation/authentication۔
- **Components:** Tab/segment switch (Login ⟷ Sign Up)، Email + Password fields، "Continue with Google/Apple" buttons، Phone OTP option، "Forgot password?" link، legal text (Terms/Privacy) checkbox on signup۔
- **User Actions:** Enter credentials → submit؛ social login tap؛ switch between login/signup؛ password visibility toggle۔
- **Navigation:** Success → Home (پہلی بار ہو تو optional quick "wellness goals" micro-survey پہلے)۔ "Forgot password" → reset flow (email link)۔
- **Empty State:** N/A۔
- **Loading State:** Submit button → inline spinner + disabled state ("Signing in…")۔
- **Error State:** Inline field-level errors (invalid email, weak password)؛ top banner for auth failures ("غلط email/password")؛ rate-limit error پر cooldown message۔
- **Mobile Responsive:** Keyboard-aware scroll (fields کبھی keyboard کے نیچے چھپیں نہیں)؛ social buttons full-width stacked۔

---

# PART B — Shopping / Commerce Flow

## 4. Home
- **Purpose:** Personalized landing hub — new arrivals، recommended products، wellness snapshot teaser، promotions۔
- **Components:** Top bar (logo, search icon, notification bell, cart icon w/ badge)، hero banner/carousel (promos)، "Shop by Category" horizontal chips، "Recommended for you" product carousel، "Your Wellness Today" mini-widget (hydration ring + journal streak teaser — deep-link to Wellness Dashboard)، "New Arrivals" grid، footer trust badges (secure payment, easy returns)۔
- **User Actions:** Search tap، category tap، product card tap، wishlist heart tap on card، scroll browse، wellness widget tap۔
- **Navigation:** → Product Listing (category)، → Product Details (product tap)، → Search results، → Wellness Dashboard (widget)۔
- **Empty State:** N/A (fallback: generic curated products اگر personalization data نہیں)۔
- **Loading State:** Skeleton cards for carousels/grid (shimmer)۔
- **Error State:** Section-level fallback ("یہ حصہ لوڈ نہیں ہو سکا" + retry) — پوری screen fail نہ ہو ایک section کی وجہ سے۔
- **Mobile Responsive:** Single-column stacked sections، horizontal-scroll carousels؛ tablet/desktop پر 2–3 column grids۔

## 5. Product Categories
- **Purpose:** 6 product categories کا browsable overview۔
- **Components:** Grid/list of category cards (image + name + short tagline) — Yoga Mats، Fitness Trackers/Planners، Diffusers، Gum Bags، Journals، Water Bottles؛ optional "Shop All" entry۔
- **User Actions:** Category card tap۔
- **Navigation:** → Product Listing (filtered by category)۔
- **Empty State:** N/A (static content)۔
- **Loading State:** Skeleton grid (image placeholders)۔
- **Error State:** Full-page retry state اگر category data fetch fail ہو۔
- **Mobile Responsive:** 2-column grid mobile → 3–4 column tablet/desktop۔

## 6. Product Listing
- **Purpose:** Filterable/sortable product grid within a category (یا search results)۔
- **Components:** Header (category name, result count)، Filter bar (price range, color, personalizable-only toggle, availability)، Sort dropdown (popularity, price, newest)، Product grid cards (image, title, price, "Personalizable" badge, wishlist heart)، pagination/infinite scroll۔
- **User Actions:** Filter/sort apply، product card tap، wishlist toggle، infinite scroll/load-more۔
- **Navigation:** → Product Details۔ Filter tap → filter bottom-sheet (mobile) / sidebar (desktop)۔
- **Empty State:** "کوئی product نہیں ملا" illustration + "Clear filters" CTA۔
- **Loading State:** Skeleton grid on initial load؛ inline spinner at bottom for pagination۔
- **Error State:** Inline banner + retry، existing loaded products screen پر رہیں (destructive reload نہ ہو)۔
- **Mobile Responsive:** 2-column grid؛ filters bottom-sheet modal؛ desktop: persistent left sidebar filters + 3–4 column grid۔

## 7. Product Details
- **Purpose:** مکمل product information + purchase decision point۔
- **Components:** Image gallery (swipeable/zoomable)، title، price، variant selectors (size/color)، "Personalize This" primary CTA (اگر `is_personalizable`)، "Add to Cart" (non-personalized items کے لیے direct)، quantity stepper، description/materials/care accordion، reviews & ratings summary، related/"complete your set" products carousel، wishlist heart، share icon۔
- **User Actions:** Gallery swipe/zoom، variant select، personalize tap، add-to-cart tap، wishlist toggle، review scroll، related product tap۔
- **Navigation:** "Personalize This" → Product Personalization Studio۔ "Add to Cart" → inline confirmation + mini-cart preview (stay on page)۔ Cart icon → Cart۔
- **Empty State:** N/A (اگر reviews نہیں تو "ابھی کوئی review نہیں — پہلا آپ بنیں")۔
- **Loading State:** Skeleton for gallery/price/description on load۔
- **Error State:** Out-of-stock banner (variant disabled + "Notify me" option)؛ fetch fail → retry state۔
- **Mobile Responsive:** Sticky bottom bar (price + Add to Cart/Personalize) mobile پر؛ desktop: 2-column layout (gallery left، info right، sticky)۔

## 8. Product Personalization Studio
- **Purpose:** Config-driven canvas editor جہاں user text/image/color layers customize کرے (architecture کے section 9 کے مطابق)۔
- **Components:** Canvas area (center، product mockup + editable print zones highlighted)، left/bottom toolbar: text tool (font, size, color picker)، image upload tool، color/pattern swatches، layer list (reorder/delete)، undo/redo، "Reset design"، save/template picker (start from saved template)، live price update (اگر add-ons cost بڑھائیں)، "Preview" CTA۔
- **User Actions:** Tap print zone to edit، type text، upload image (crop/position/scale)، pick color، drag to reposition، undo/redo، save as draft، load template۔
- **Navigation:** "Preview" → Live Product Preview۔ Back → Product Details (draft auto-saved prompt اگر unsaved changes)۔
- **Empty State:** پہلی بار empty canvas + subtle placeholder hints ("یہاں tap کر کے اپنا نام لکھیں")۔
- **Loading State:** Canvas asset load پر skeleton/blur-up product mockup؛ image upload پر progress bar۔
- **Error State:** Text limit exceeded (inline character-count warning)؛ image upload fail (retry + format/size guidance)؛ unsupported print-zone action gracefully disabled (grayed out with tooltip)۔
- **Mobile Responsive:** Toolbar bottom-sheet (collapsible)، canvas zoom/pinch enabled، single-tool-panel-at-a-time on small screens؛ desktop: side panel + larger canvas، multi-panel simultaneously visible۔

## 9. Live Product Preview
- **Purpose:** Customized design کو final photorealistic-ish mockup میں دکھانا (confidence-building step پہلے checkout سے)۔
- **Components:** Large rendered preview (rotatable 360°/multi-angle اگر 3D — یوگا میٹ کے لیے مستقبل میں)، "Edit Design" secondary button، price breakdown (base + personalization fee)، "Add to Cart" primary CTA، size/qty selector۔
- **User Actions:** Rotate/zoom preview، edit tap (back to Studio)، add to cart۔
- **Navigation:** "Edit Design" → back to Personalization Studio (state preserved)۔ "Add to Cart" → inline success + Cart۔
- **Empty State:** N/A۔
- **Loading State:** Render-generation progress indicator ("آپ کا design تیار ہو رہا ہے…") — چونکہ server-side render async ہے، skeleton/shimmer preview کے ساتھ۔
- **Error State:** Render fail → "دوبارہ کوشش کریں" + fallback to last-good preview/flat design summary۔
- **Mobile Responsive:** Full-width preview، swipe for angles؛ sticky bottom Add-to-Cart bar۔

## 10. Cart
- **Purpose:** Selected items review قبل از checkout۔
- **Components:** Line items (thumbnail — personalized items کا mini design preview، title, variant, qty stepper, price, remove)، promo code input، order summary (subtotal, shipping estimate, tax, total)، "Proceed to Checkout" CTA، "Continue Shopping" link، cross-sell strip ("You might also like")۔
- **User Actions:** Qty change، remove item، apply promo، proceed to checkout۔
- **Navigation:** → Checkout۔ Item thumbnail tap (non-personalized) → Product Details۔
- **Empty State:** Illustration + "آپ کا cart خالی ہے" + "Start Shopping" CTA۔
- **Loading State:** Skeleton line items on load؛ inline spinner on qty/promo update۔
- **Error State:** Invalid/expired promo code inline error؛ stock-conflict banner (اگر checkout سے پہلے کوئی item out-of-stock ہو جائے) — item auto-flagged with "remove" prompt۔
- **Mobile Responsive:** Stacked list، sticky bottom summary+CTA bar؛ desktop: 2-column (items left، summary right sticky)۔

## 11. Checkout
- **Purpose:** Address, shipping, payment finalize کرنا۔
- **Components:** Multi-step (Address → Shipping method → Payment) یا single-page accordion؛ saved addresses list/new address form؛ shipping method radio (standard/express)؛ payment method selector (Stripe card, JazzCash/Easypaisa, Cash on Delivery)؛ order summary sidebar (persistent)؛ "Place Order" CTA؛ promo/coupon field (اگر cart سے نہیں لگایا)۔
- **User Actions:** Address select/add، shipping method select، payment method select + enter details، place order tap۔
- **Navigation:** Success → Order Confirmation۔ Back → Cart۔
- **Empty State:** No saved addresses → form directly shown (default state، empty نہیں treated)۔
- **Loading State:** "Place Order" button loading/disabled during payment processing؛ payment gateway redirect پر full-screen "Processing payment…" state۔
- **Error State:** Payment failure banner (specific reason اگر gateway دے، ورنہ generic + retry)؛ address validation inline errors؛ COD unavailable-for-area warning۔
- **Mobile Responsive:** Step-by-step wizard (ایک وقت میں ایک step) mobile پر بہتر UX؛ desktop: single scrollable page with sticky summary sidebar۔

## 12. Order Confirmation
- **Purpose:** Purchase success confirmation + immediate next steps۔
- **Components:** Success animation/checkmark، order number، estimated delivery date، order summary recap، "Track Order" CTA، "Continue Shopping" CTA، "you might also enjoy" wellness cross-promo (e.g. "اپنی hydration tracking ابھی شروع کریں")۔
- **User Actions:** Track order tap، continue shopping tap، share/screenshot (implicit)۔
- **Navigation:** → Order Tracking یا → Home۔
- **Empty State:** N/A۔
- **Loading State:** Momentary while order confirmation data fetch ہو (skeleton for summary)۔
- **Error State:** اگر order placed ہو گیا مگر confirmation fetch fail ہو → "Order placed ✅، details load نہیں ہو سکیں" + link to Orders list (کبھی user کو یہ نہ لگے کہ order fail ہوا)۔
- **Mobile Responsive:** Centered single-column، celebratory but calm animation (subtle، over-the-top confetti نہیں — brand tone کے مطابق)۔

## 13. Order Tracking
- **Purpose:** Individual order کی real-time status/progress دیکھنا۔
- **Components:** Order status stepper/timeline (Placed → In Production → Shipped → Out for Delivery → Delivered — architecture کے order state machine کے مطابق)، courier tracking number + link، item list with personalization thumbnails، delivery address، support/contact CTA، cancel-order option (اگر status ابھی cancellable stage پر ہو)۔
- **User Actions:** Timeline scroll/view، tracking number tap (external courier link)، contact support tap، cancel request tap۔
- **Navigation:** From Orders list (Profile) یا Order Confirmation۔ Back → Orders list۔
- **Empty State:** N/A (specific order context)۔
- **Loading State:** Skeleton timeline + item list۔
- **Error State:** Tracking data temporarily unavailable → "Status update میں وقت لگ سکتا ہے" fallback message با last-known status۔
- **Mobile Responsive:** Vertical timeline، collapsible item details؛ desktop: timeline + sidebar detail panel۔

---

# PART C — Wellness Ecosystem

## 14. Wellness Dashboard
- **Purpose:** Unified daily wellness home — commerce سے الگ mental model، مگر ایک ہی nav کے اندر۔
- **Components:** Greeting header (personalized, e.g. "صبح بخیر، Ani")، today's summary cards (hydration ring, journal streak flame, fitness activity ring)، "Today's Plan" card (from active wellness plan)، quick-log shortcuts (Log Water, New Journal Entry, Log Workout)، motivational quote/tip banner، streak/achievements strip۔
- **User Actions:** Quick-log taps، widget tap (drill into module)، plan card tap۔
- **Navigation:** → Fitness Planner / Hydration Tracker / Gratitude Journal / Mindfulness (respective widget taps)۔
- **Empty State:** First-time user → "اپنا پہلا log کریں" onboarding prompts on each empty widget۔
- **Loading State:** Skeleton widgets (rings/cards shimmer)۔
- **Error State:** Per-widget fallback ("data load نہیں ہو سکا") — دوسرے widgets unaffected رہیں۔
- **Mobile Responsive:** Vertical stacked cards، horizontal-scroll quick actions؛ desktop: dashboard grid (2–3 column widget layout)۔

## 15. Fitness Planner
- **Purpose:** Activity logging + weekly fitness plan view۔
- **Components:** Weekly calendar strip، activity log list (type, duration, calories)، "+ Log Activity" FAB/button (type picker: yoga/walk/gym/etc, duration, notes)، weekly summary chart (Recharts)، active wellness-plan schedule (from `wellness_plans`)۔
- **User Actions:** Log new activity، edit/delete log entry، switch week، view plan detail۔
- **Navigation:** From Wellness Dashboard۔ Back → Wellness Dashboard۔
- **Empty State:** "ابھی کوئی activity log نہیں" + illustration + "Log your first workout" CTA۔
- **Loading State:** Skeleton chart + list on load۔
- **Error State:** Log-save fail → inline retry toast، form data preserved (لکھا ہوا data ضائع نہ ہو)۔
- **Mobile Responsive:** FAB bottom-right، horizontal-scroll calendar strip؛ desktop: sidebar calendar + main content chart/list۔

## 16. Hydration Tracker
- **Purpose:** Daily water intake logging vs goal۔
- **Components:** Large hydration ring/progress visual (current ml / goal ml)، quick-add buttons (+250ml, +500ml, custom amount)، daily goal setting، history graph (weekly trend)، reminder settings shortcut، "matching water bottle" cross-sell card (ecosystem tie-in)۔
- **User Actions:** Quick-add tap، custom amount entry، goal edit، view history۔
- **Navigation:** From Wellness Dashboard۔ Cross-sell card → Product Details (water bottle)۔
- **Empty State:** Ring shows 0/goal با gentle prompt "پہلا glass log کریں"۔
- **Loading State:** Ring skeleton/pulse animation while data loads۔
- **Error State:** Log-add fail → toast + optimistic-UI rollback (ring پہلے update ہو، fail پر revert)۔
- **Mobile Responsive:** Large centered ring (thumb-friendly quick-add buttons نیچے)؛ desktop: ring + side history chart۔

## 17. Gratitude Journal
- **Purpose:** Daily gratitude/reflection entries۔
- **Components:** Entry list (date, mood emoji, preview text)، "+ New Entry" button، entry composer (prompt suggestion, gratitude items input — multi-item list, mood selector, free-text)، streak indicator، prompt library shortcut۔
- **User Actions:** New entry create، existing entry view/edit، mood select، prompt browse۔
- **Navigation:** From Wellness Dashboard۔ "+ New Entry" → composer (modal/full-screen)۔
- **Empty State:** "اپنی پہلی gratitude entry لکھیں" + curated starter prompts۔
- **Loading State:** Skeleton list on load۔
- **Error State:** Save fail → "محفوظ نہیں ہو سکا، دوبارہ کوشش کریں" + draft retained locally (data loss سے بچاؤ، sensitive content ہے)۔
- **Mobile Responsive:** Full-screen composer mobile پر (distraction-free)؛ desktop: split-view (list left، composer/detail right)۔

## 18. Mindfulness
- **Purpose:** Guided breathing/meditation/mindfulness exercises (short sessions)۔
- **Components:** Session category cards (Breathing, Body Scan, Sleep, Focus)، session player (audio/timer with calm visual animation — breathing circle expand/contract)، duration selector، session history/streak۔
- **User Actions:** Category select، session start/pause/stop، duration pick۔
- **Navigation:** From Wellness Dashboard۔ Session card → Player screen۔
- **Empty State:** N/A (curated content library، ہمیشہ populated)۔
- **Loading State:** Audio buffering indicator، skeleton category grid۔
- **Error State:** Audio load fail → retry + fallback text-guided instructions۔
- **Mobile Responsive:** Full-screen immersive player (minimal chrome، calm background)؛ desktop: centered player card۔

---

# PART D — Personal / Account

## 19. My Designs
- **Purpose:** Saved/past personalization drafts اور previously-ordered custom designs کا library۔
- **Components:** Grid of design thumbnails (status tag: Draft/Ordered)، "New Design" CTA، design card actions (edit, reorder, delete, duplicate)۔
- **User Actions:** Design tap (open in Studio)، reorder tap (→ Product Details/Cart pre-filled)، delete/duplicate۔
- **Navigation:** From Profile۔ Design tap → Personalization Studio (load draft)۔
- **Empty State:** "ابھی کوئی design نہیں بنایا" + "Start Personalizing" CTA → Categories۔
- **Loading State:** Skeleton grid۔
- **Error State:** Load fail → retry banner۔
- **Mobile Responsive:** 2-column grid mobile → 3–4 column desktop۔

## 20. Wishlist
- **Purpose:** Saved-for-later products۔
- **Components:** Product grid (same card style as listing)، remove-from-wishlist icon، "Move to Cart" quick action۔
- **User Actions:** Product tap، remove، move-to-cart۔
- **Navigation:** From Profile/Home heart icon۔ Product tap → Product Details۔
- **Empty State:** "آپ کی wishlist خالی ہے" + "Browse Products" CTA۔
- **Loading State:** Skeleton grid۔
- **Error State:** Remove/move action fail → toast retry۔
- **Mobile Responsive:** 2-column grid؛ swipe-to-remove gesture (mobile) اختیاری۔

## 21. Profile
- **Purpose:** User identity hub + navigation to account sub-sections۔
- **Components:** Avatar + name/email header، menu list (My Orders, My Designs, Wishlist, Addresses, Payment Methods, Wellness Goals, Settings, Help/Support, Logout)، wellness summary snapshot (optional teaser)۔
- **User Actions:** Menu item tap، avatar edit، logout۔
- **Navigation:** → respective sub-screens (Orders list، My Designs، Wishlist، Settings، etc.)۔
- **Empty State:** N/A (structural menu screen)۔
- **Loading State:** Header skeleton (avatar/name) on initial load۔
- **Error State:** Profile fetch fail → cached/last-known data show + subtle refresh-failed indicator۔
- **Mobile Responsive:** Single-column list؛ desktop: sidebar navigation layout (profile menu left, content right)۔

## 22. Settings
- **Purpose:** Account preferences، notifications، privacy controls۔
- **Components:** Sections: Account (email/phone/password change)، Notifications (toggles: order updates, wellness reminders, promotions)، Privacy (data export request, delete account)، App preferences (language: Urdu/English, theme اگر dark mode ہو)، About/Legal links۔
- **User Actions:** Toggle switches، form edits (password change etc.)، data export/delete request، language switch۔
- **Navigation:** From Profile۔ Sub-items → dedicated forms (modal/sub-screen)۔
- **Empty State:** N/A۔
- **Loading State:** Toggle optimistic-update با inline spinner on save۔
- **Error State:** Save fail → inline error + revert toggle state۔
- **Mobile Responsive:** Grouped list sections (iOS-settings-style)؛ desktop: two-column settings layout (nav left, form right)۔

---

# PART E — Admin Panel

> Role-gated (`admin`/`staff`)، separate layout: **persistent left sidebar nav** (desktop-first tool, tablet-responsive؛ mobile کم priority مگر graceful degrade ہونا چاہیے)۔

## A1. Admin Login
- **Purpose:** Secure staff/admin authentication (separate route/guard from customer login)۔
- **Components:** Email+password form، (production کے لیے) MFA code field۔
- **User Actions:** Submit credentials، MFA code entry۔
- **Navigation:** Success → Admin Dashboard۔
- **Empty/Loading/Error:** Standard form states — loading spinner on submit، inline error on invalid credentials/MFA، lockout message after repeated failures۔
- **Mobile Responsive:** Simple centered form، usable on tablet (admin مقصد کے لیے desktop-primary)۔

## A2. Admin Dashboard (Overview)
- **Purpose:** At-a-glance business + wellness engagement health۔
- **Components:** KPI cards (Today's sales, Orders pending, Active users, Low-stock alerts)، sales trend chart، top-selling products، recent orders table (mini)، wellness engagement snapshot (DAU, streak completions — retention signal)۔
- **User Actions:** Date-range filter، KPI card click-through، recent order row click۔
- **Navigation:** → Order Management (from recent orders)، → Reports (from charts "View full report")۔
- **Empty State:** New store → "ابھی کوئی data نہیں، پہلا product add کریں" prompts۔
- **Loading State:** Skeleton KPI cards + chart shimmer۔
- **Error State:** Per-widget error fallback (retry icon on failed card)۔
- **Mobile Responsive:** Stacked cards (single column) on tablet/mobile fallback؛ primary experience desktop grid۔

## A3. Product Management (List)
- **Purpose:** تمام products/variants کا catalog management view۔
- **Components:** Data table (image, title, category, price, stock, status, personalizable flag)، search/filter bar، bulk actions (activate/deactivate, delete)، "+ Add Product" CTA۔
- **User Actions:** Search/filter، row click (edit)، bulk select+action، add new۔
- **Navigation:** Row/Add → Product Create/Edit۔
- **Empty State:** "کوئی products نہیں" + "Add your first product" CTA۔
- **Loading State:** Skeleton table rows۔
- **Error State:** Table load fail → retry banner؛ bulk action fail → per-row error indicator۔
- **Mobile Responsive:** Table → collapses to card-list view on small screens۔

## A4. Product Create / Edit (incl. Personalization Config Editor)
- **Purpose:** Product data entry + **print-zone/personalization config builder** (architecture section 9.2 کا admin-facing tool)۔
- **Components:** Tabs: General Info (title, description, price, images upload)، Variants (size/color/stock matrix)، Personalization Config (visual print-zone editor — drag zone boundaries on mockup image, define type text/image/color, constraints like max_chars/fonts/palette — outputs JSON)، SEO/Visibility toggle۔
- **User Actions:** Fill fields، upload images (drag-drop)، define/edit print zones visually، save/publish/draft۔
- **Navigation:** Save → back to Product List (toast confirmation)۔ Cancel → confirm-discard dialog اگر unsaved changes۔
- **Empty State:** New product → all fields blank با helpful placeholder text/examples۔
- **Loading State:** Image upload progress bars؛ save-button loading state۔
- **Error State:** Field validation inline errors؛ image upload fail retry؛ unsaved-changes warning on navigate-away۔
- **Mobile Responsive:** Low priority — desktop-optimized tool؛ tablet: stacked tabs (readable, editing limited on phone)۔

## A5. Order Management (List)
- **Purpose:** تمام orders کا monitor/manage view۔
- **Components:** Data table (order#, customer, date, items, total, status badge, payment method)، status filter tabs (All/Pending/In Production/Shipped/Delivered/Cancelled)، search by order#/customer، export button۔
- **User Actions:** Filter/search، row click (detail)، quick status-update dropdown inline۔
- **Navigation:** Row click → Order Detail۔
- **Empty State:** Filtered view کے لیے "اس status میں کوئی order نہیں"۔
- **Loading State:** Skeleton table۔
- **Error State:** Load fail retry؛ status-update fail → row-level error toast + revert۔
- **Mobile Responsive:** Card-list fallback on small screens۔

## A6. Order Detail (Admin)
- **Purpose:** Single order کی مکمل management — status transitions، fulfillment assignment، refunds۔
- **Components:** Customer/shipping info panel، item list (with personalization design snapshot preview + link to print-ready file)، status stepper (manual transition control)، payment info + refund action، vendor/fulfillment job status (`vendor_jobs`)، internal notes field، status-history audit log۔
- **User Actions:** Status update، trigger refund، add internal note، download print file، assign/update tracking number۔
- **Navigation:** Back → Order List۔
- **Empty State:** N/A (specific order)۔
- **Loading State:** Skeleton detail panels۔
- **Error State:** Status-update/refund action fail → inline error با retry، action-confirmation dialogs for destructive ops (refund/cancel)۔
- **Mobile Responsive:** Stacked single-column panels (tablet reasonable، phone limited use-case)۔

## A7. Inventory Management
- **Purpose:** Stock levels monitor + low-stock alerts۔
- **Components:** Variant-level stock table، low-stock threshold indicators (color-coded)، manual stock adjustment form، alert list۔
- **User Actions:** Stock qty edit، threshold set، alert dismiss۔
- **Navigation:** From sidebar یا Product edit deep-link۔
- **Empty State:** N/A (always populated once products exist)۔
- **Loading State:** Skeleton table۔
- **Error State:** Save fail inline retry۔
- **Mobile Responsive:** Card-list fallback۔

## A8. Customer / User Management
- **Purpose:** Customer accounts overview + support context۔
- **Components:** User table (name, email, join date, orders count, role)، search، user detail drawer (order history, wellness engagement summary — support کے لیے، مگر journal content کبھی expose نہ ہو — privacy)، role management (promote to staff)۔
- **User Actions:** Search، row click (detail drawer)، role change (admin-only permission)۔
- **Navigation:** Detail drawer → linked Order Detail (from order history)۔
- **Empty State:** N/A۔
- **Loading State:** Skeleton table + drawer۔
- **Error State:** Load fail retry۔
- **Mobile Responsive:** Card-list fallback، drawer → full-screen modal on mobile۔

## A9. Content Management (Wellness Plans / Journal Prompts)
- **Purpose:** Wellness plan templates اور journal prompt library curate کرنا (non-technical content ops)۔
- **Components:** List of plan templates/prompts (CRUD)، rich-text/structured editor for plan schedule (weekly goals jsonb)، category tagging۔
- **User Actions:** Create/edit/delete content items، publish/unpublish۔
- **Navigation:** From sidebar۔
- **Empty State:** "ابھی کوئی template نہیں" + create CTA۔
- **Loading State:** Skeleton list۔
- **Error State:** Save fail inline retry۔
- **Mobile Responsive:** Desktop-primary tool، tablet workable۔

## A10. Reports & Analytics
- **Purpose:** Revenue، product performance، wellness-feature engagement (retention insight) deep-dive۔
- **Components:** Date-range picker، chart tabs (Revenue, Top Products, Personalization Popularity, Wellness Engagement)، export-to-CSV button۔
- **User Actions:** Range select، tab switch، export۔
- **Navigation:** Standalone (from sidebar/dashboard "View full report")۔
- **Empty State:** Insufficient-data message for new stores۔
- **Loading State:** Chart skeleton/shimmer۔
- **Error State:** Query timeout/fail → retry + narrower-range suggestion۔
- **Mobile Responsive:** Charts horizontally scrollable on small screens؛ desktop-primary۔

## A11. Admin Settings (Roles & Store Config)
- **Purpose:** Store-level configuration + staff role management۔
- **Components:** Staff list + role assignment، store info (shipping rates, tax settings)، payment gateway keys config (masked)، coupon management۔
- **User Actions:** Add/remove staff، edit store config، create coupon۔
- **Navigation:** From sidebar۔
- **Empty State:** N/A۔
- **Loading State:** Form-field skeletons۔
- **Error State:** Save fail inline retry؛ destructive actions (remove staff) require confirm dialog۔
- **Mobile Responsive:** Desktop-primary۔

---

# PART F — Complete Navigation Map

## F.1 Customer App — Top-Level Structure

```
Splash
  └─▶ (session?) ──yes──▶ Home
                 └─no──▶ Onboarding ──▶ Sign Up / Login ──▶ Home

┌─────────────────────────────────────────────────────────────────┐
│                    BOTTOM TAB BAR (persistent)                    │
│   Home   │   Shop   │   Wellness   │   Cart   │   Profile         │
└─────────────────────────────────────────────────────────────────┘

Home
 ├─▶ Search results ─▶ Product Details
 ├─▶ Category chip ─▶ Product Listing
 ├─▶ Product card ─▶ Product Details
 └─▶ Wellness widget ─▶ Wellness Dashboard

Shop (tab root = Product Categories)
 └─▶ Product Categories
      └─▶ Product Listing (filtered)
           └─▶ Product Details
                ├─▶ [non-personalized] Add to Cart (stays) ─▶ Cart
                └─▶ [personalizable] Personalization Studio
                     └─▶ Live Product Preview
                          └─▶ Add to Cart ─▶ Cart

Cart (tab)
 └─▶ Checkout
      └─▶ Order Confirmation
           ├─▶ Order Tracking
           └─▶ Home

Wellness (tab root = Wellness Dashboard)
 └─▶ Wellness Dashboard
      ├─▶ Fitness Planner
      ├─▶ Hydration Tracker ──▶ (cross-sell) Product Details
      ├─▶ Gratitude Journal
      └─▶ Mindfulness

Profile (tab)
 └─▶ Profile
      ├─▶ My Orders (list) ─▶ Order Tracking
      ├─▶ My Designs ─▶ Personalization Studio (edit draft)
      ├─▶ Wishlist ─▶ Product Details
      ├─▶ Addresses / Payment Methods
      ├─▶ Wellness Goals
      ├─▶ Settings
      ├─▶ Help/Support
      └─▶ Logout ─▶ Login
```

## F.2 Cross-Cutting / Global Navigation Rules
- **Bottom tab bar** ہمیشہ visible رہتا ہے سوائے: Splash، Onboarding، Auth، Personalization Studio (immersive/full-focus mode), Checkout (focused flow), Mindfulness Player (immersive)۔
- **Cart icon badge** (item count) globally header میں persistent (Home/Shop/Product screens)۔
- **Deep-linking**: Order confirmation emails/SMS → Order Tracking screen directly؛ wellness reminder push notifications → respective module (Hydration/Journal) directly۔
- **Back behavior**: Personalization Studio → Live Preview → back راستہ Studio (state preserved، data loss نہیں)؛ Checkout steps → back moves one step, not full-exit (confirm dialog اگر exit پوری checkout)۔

## F.3 Admin Panel — Top-Level Structure

```
Admin Login
 └─▶ Admin Dashboard (Overview)
      ┌──────────────────────────────────────────────┐
      │        PERSISTENT LEFT SIDEBAR (desktop)        │
      │  Dashboard · Products · Orders · Inventory ·    │
      │  Customers · Content · Reports · Settings       │
      └──────────────────────────────────────────────┘

 ├─▶ Products (list) ─▶ Product Create/Edit (+ Personalization Config Editor)
 ├─▶ Orders (list) ─▶ Order Detail (status, refund, fulfillment)
 ├─▶ Inventory
 ├─▶ Customers (list) ─▶ Customer Detail drawer ─▶ (linked) Order Detail
 ├─▶ Content (Wellness Plans / Journal Prompts) ─▶ Content Editor
 ├─▶ Reports & Analytics
 └─▶ Settings (Roles, Store Config, Coupons)
```

## F.4 End-to-End Critical User Journeys (validation reference)

**Journey 1 — Personalized Purchase:**
`Home → Product Categories → Product Listing → Product Details → Personalization Studio → Live Preview → Cart → Checkout → Order Confirmation → Order Tracking`

**Journey 2 — Daily Wellness Habit Loop:**
`Push Notification → Hydration Tracker (quick-log) → Wellness Dashboard (streak updated) → cross-sell nudge → Product Details (bottle)`

**Journey 3 — Admin Fulfillment:**
`Admin Login → Dashboard (pending orders alert) → Order Management → Order Detail → status update to "In Production" → vendor job triggered → status "Shipped" (tracking added) → customer notified`

---

*یہ UI/UX specification `ARCHITECTURE.md` کے ساتھ مل کر implementation phase کی بنیاد بنتی ہے۔ اگلا step (آپ کی approval کے بعد): high-fidelity design system tokens (Figma-ready) یا direct component scaffolding۔*

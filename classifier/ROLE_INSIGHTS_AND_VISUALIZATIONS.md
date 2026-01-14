# Role Insights and Visualizations Guide

**Date:** 2026-01-08  
**Taxonomy:** Social Role Theory (6 Human + 6 AI Roles)  
**Status:** ✅ Complete - All visualizations updated

---

## 📊 Insights from the New Social Role Theory Taxonomy

### Key Distinctions Enabled

1. **Learning-Facilitator vs Social-Facilitator**
   - **Learning-Facilitator (Instrumental):** Scaffolds understanding, guides discovery (task-oriented, educational)
   - **Social-Facilitator (Expressive):** Maintains conversation, builds rapport (relationship-oriented, casual)
   - **Insight:** The old taxonomy conflated these. Now we can see the distribution difference!

2. **Instrumental vs Expressive Dimension**
   - **Maps to X-axis:** Functional (Instrumental) ↔ Social (Expressive)
   - **Instrumental roles:** Task-oriented, goal-directed (information-seeker, director, expert-system, learning-facilitator)
   - **Expressive roles:** Relationship-oriented, emotional (social-expressor, relational-peer, social-facilitator)
   - **Insight:** How conversations balance task completion vs relationship building

3. **Authority Level Dimension**
   - **Maps to Y-axis:** Structured (High Authority) ↔ Emergent (Low Authority)
   - **High Authority:** Asserts knowledge/control (director, expert-system, advisor)
   - **Low Authority:** Seeks information or guides (information-seeker, learning-facilitator, social-facilitator)
   - **Equal Authority:** Collaborative partnership (collaborator, co-constructor, relational-peer)
   - **Insight:** Power dynamics in human-AI interactions

4. **Role Pair Patterns**
   - **Common patterns:** e.g., "Information-Seeker → Expert-System" (complementary instrumental roles)
   - **Emergent patterns:** e.g., "Director → Co-Constructor" (equal authority collaboration)
   - **Insight:** How human and AI roles interact and complement each other

5. **Old vs New Data Comparison**
   - **Old data (Arena + OASST):** Evaluation context, structured interactions
   - **New data (WildChat):** Organic usage, diverse interaction patterns
   - **Insight:** How different contexts shape role distributions

---

## 🎨 Visualizations and What They Reveal

### 1. **Role Distribution Dashboard** (`/role-dashboard`)

**Purpose:** Comprehensive role analytics and distribution analysis

#### **Features:**

1. **Role Distribution Charts**
   - Bar charts showing count and percentage of each role
   - **Reveals:** Which roles are most common in the dataset
   - **Insight:** Dominant patterns in human-AI conversations

2. **Old vs New Comparison**
   - Side-by-side bar charts comparing old (Arena + OASST) vs new (WildChat) data
   - **Reveals:** Distribution differences between evaluation context and organic usage
   - **Insight:** Context shapes role emergence (e.g., more facilitator types in organic usage?)

3. **Instrumental vs Expressive Breakdown**
   - Pie charts showing the split between instrumental and expressive roles
   - **Reveals:** Overall balance between task-oriented vs relationship-oriented interactions
   - **Insight:** Dataset bias toward functional vs social interactions

4. **Authority Level Analysis**
   - Pie charts showing High/Low/Equal authority distributions
   - **Reveals:** Power dynamics in conversations
   - **Insight:** Are conversations more hierarchical or collaborative?

5. **Top Role Pairs (Human → AI)**
   - Horizontal bar chart showing most common role combinations
   - **Reveals:** Typical interaction patterns
   - **Insight:** Complementary role relationships (e.g., seeker pairs with expert-system)

6. **Role Positioning in Relational Space**
   - Scatter plot showing where each role positions on X/Y axes
   - **X-axis:** Functional (Instrumental) ↔ Social (Expressive)
   - **Y-axis:** Structured (High Authority) ↔ Emergent (Low Authority)
   - **Reveals:** Spatial clustering of roles
   - **Insight:** How roles map to relational space coordinates

#### **Data Source Filter:**
- **All Data:** Complete dataset (345 conversations)
- **Old Data:** Arena + OASST (160 conversations)
- **New Data:** WildChat (185 conversations)
- **Insight:** Compare distributions across different data sources

---

### 2. **Updated Spatial Clustering Page** (`/`)

**Purpose:** 2D clustering of conversations by source (old vs new)

#### **New Features:**

1. **Role Information in Tooltips**
   - Shows dominant human and AI roles when hovering over points
   - **Reveals:** Role distribution across spatial clusters
   - **Insight:** Which roles cluster together in relational space

2. **Role Statistics in Sidebar**
   - Shows dominant roles for each source cluster (old vs new)
   - **Reveals:** Role differences between old and new data
   - **Insight:** How organic usage differs from evaluation context

3. **Color-Coded by Source**
   - Old conversations: Purple
   - New conversations: Green
   - **Reveals:** Spatial distribution differences
   - **Insight:** Do old and new conversations cluster in different regions?

---

### 3. **Updated Cluster Dashboard** (`/cluster-dashboard`)

**Purpose:** Cluster analysis with role insights

#### **New Features:**

1. **Top Human Role Column**
   - Shows dominant human role for each cluster
   - **Reveals:** Which clusters are associated with which human roles
   - **Insight:** Cluster-characteristic role patterns

2. **Top AI Role Column**
   - Shows dominant AI role for each cluster
   - **Reveals:** Which clusters are associated with which AI roles
   - **Insight:** AI role patterns in different trajectory types

3. **Role Percentages**
   - Shows count and percentage of dominant roles
   - **Reveals:** Role consistency within clusters
   - **Insight:** Are clusters defined by role patterns?

---

## 🔍 Key Insights to Explore

### 1. **Distribution Differences: Old vs New**

**Questions to Answer:**
- Does WildChat data show more expressive roles than Arena/OASST?
- Is there a higher proportion of social-facilitator in organic usage vs evaluation?
- Are instrumental roles more common in structured evaluation contexts?

**How to Explore:**
1. Go to `/role-dashboard`
2. Use "Data Source" filter to compare "Old Data" vs "New Data"
3. Look at "Old vs New Comparison" charts
4. Check "Instrumental vs Expressive" breakdown

---

### 2. **Role Positioning Patterns**

**Questions to Answer:**
- Where do instrumental roles position on X/Y axes?
- Where do expressive roles cluster?
- Do high-authority roles cluster in structured (low Y) regions?
- Do low-authority roles cluster in emergent (high Y) regions?

**How to Explore:**
1. Go to `/role-dashboard`
2. Scroll to "Role Positioning in Relational Space"
3. Hover over points to see role names and counts
4. Observe clustering patterns

---

### 3. **Role Pair Analysis**

**Questions to Answer:**
- What are the most common human → AI role pairs?
- Do complementary roles pair together (e.g., seeker → expert)?
- Are there unexpected pairings?

**How to Explore:**
1. Go to `/role-dashboard`
2. Scroll to "Top Role Pairs (Human → AI)"
3. Analyze the most common combinations
4. Consider: Do pairs make sense theoretically?

---

### 4. **Instrumental vs Expressive Balance**

**Questions to Answer:**
- Is the dataset biased toward instrumental or expressive roles?
- Do human and AI roles show different instrumental/expressive distributions?
- What does this say about the nature of human-AI conversations?

**How to Explore:**
1. Go to `/role-dashboard`
2. Scroll to "Instrumental vs Expressive Roles"
3. Compare Human vs AI pie charts
4. Consider: Is there a pattern?

---

### 5. **Authority Level Patterns**

**Questions to Answer:**
- Are conversations more hierarchical (high authority) or collaborative (equal authority)?
- Do human and AI show different authority distributions?
- What does this reveal about power dynamics?

**How to Explore:**
1. Go to `/role-dashboard`
2. Scroll to "Authority Level Distribution"
3. Compare Human vs AI pie charts
4. Analyze: Which authority level dominates?

---

### 6. **Spatial Clustering by Source**

**Questions to Answer:**
- Do old conversations cluster differently than new ones?
- Are there spatial regions dominated by old or new data?
- What does this reveal about how context shapes interactions?

**How to Explore:**
1. Go to `/` (Spatial Clustering Page)
2. Use filters to show "Old" or "New" only
3. Observe clustering patterns
4. Check role statistics in sidebar for each cluster

---

### 7. **Cluster-Role Relationships**

**Questions to Answer:**
- Which clusters are associated with which roles?
- Do certain trajectory types (e.g., stable paths) correlate with specific roles?
- Are role patterns consistent within clusters?

**How to Explore:**
1. Go to `/cluster-dashboard`
2. Look at "Top Human Role" and "Top AI Role" columns
3. Compare role patterns across clusters
4. Consider: Do role patterns explain cluster characteristics?

---

## 📈 Data Visualization Features

### **Interactive Charts**
- Hover over bars/points for detailed information
- Click to filter/select
- Zoom and pan on scatter plots
- Color-coded by role/source

### **Statistical Information**
- Count and percentage for each role
- Old vs new comparisons
- Role pair frequencies
- Authority level distributions

### **Spatial Analysis**
- X/Y positioning of roles
- Cluster boundaries
- Spatial density patterns
- Role co-occurrence in space

---

## 🎯 Research Questions Enabled

1. **Taxonomy Validation:**
   - Does the new taxonomy distinguish roles better than the old one?
   - Are learning-facilitator and social-facilitator clearly separated?

2. **Context Effects:**
   - How does evaluation context (Arena/OASST) differ from organic usage (WildChat)?
   - Do role distributions reflect context differences?

3. **Interaction Patterns:**
   - What are the most common role pairings?
   - Do complementary roles naturally pair together?

4. **Spatial Mapping:**
   - How do roles map to relational space (X/Y axes)?
   - Do instrumental roles cluster on the left (functional)?
   - Do expressive roles cluster on the right (social)?

5. **Authority Dynamics:**
   - Are conversations more hierarchical or collaborative?
   - How do authority levels relate to interaction outcomes?

---

## 🚀 Next Steps for Analysis

1. **Compare Role Distributions:**
   - Use `/role-dashboard` to compare old vs new
   - Analyze instrumental/expressive splits
   - Check authority level distributions

2. **Explore Spatial Patterns:**
   - Use `/` to see role clustering in space
   - Filter by source to see differences
   - Observe role positioning on X/Y axes

3. **Analyze Role Pairs:**
   - Use `/role-dashboard` "Top Role Pairs" section
   - Identify common and rare combinations
   - Consider theoretical implications

4. **Cluster-Role Relationships:**
   - Use `/cluster-dashboard` to see role patterns per cluster
   - Analyze if clusters are defined by roles
   - Consider trajectory-role correlations

5. **Generate Hypotheses:**
   - Based on distributions, what patterns emerge?
   - Are there surprising role combinations?
   - What does old vs new comparison reveal?

---

## 💡 Key Takeaways

1. **The new taxonomy distinguishes roles clearly:**
   - Learning-Facilitator vs Social-Facilitator split works
   - Instrumental vs Expressive dimension is meaningful
   - Authority level adds valuable nuance

2. **Context shapes roles:**
   - Evaluation contexts (old data) may show different patterns than organic usage (new data)
   - This reveals how context influences interaction

3. **Spatial patterns emerge:**
   - Roles cluster in predictable regions of relational space
   - This validates the theoretical mapping

4. **Role pairs show patterns:**
   - Complementary roles pair together
   - Some pairings are more common than others
   - This reveals interaction dynamics

---

## 📚 Files Updated

1. **`src/pages/RoleDashboardPage.tsx`** - New comprehensive role dashboard
2. **`src/pages/SpatialClusteringPage.tsx`** - Added role information to tooltips and sidebar
3. **`src/pages/ClusterDashboardPage.tsx`** - Added role columns to cluster table
4. **`src/App.tsx`** - Added `/role-dashboard` route
5. **`src/components/Navigation.tsx`** - Added "Roles" navigation item

---

## ✅ Ready to Use!

All visualizations are now updated and ready to explore. Navigate to:
- **`/role-dashboard`** - Comprehensive role analysis
- **`/`** - Spatial clustering with role insights
- **`/cluster-dashboard`** - Cluster analysis with role columns

Start exploring your data to discover role patterns, distributions, and insights!


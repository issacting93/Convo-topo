# Sources of Deep Human-AI Conversations

This document lists the best datasets and sources for finding deep, meaningful conversations between humans and AI systems.

## ⭐ Top Recommendations

### 1. **ShareGPT** - Best for Real Human-AI Conversations
- **Source**: [HuggingFace](https://huggingface.co/datasets/anon8231489123/ShareGPT_Vicuna_unfiltered)
- **Description**: Real conversations between humans and ChatGPT, collected from ShareGPT platform
- **Size**: Millions of conversations
- **Format**: JSON with user/assistant messages
- **Quality**: High - real user interactions with GPT models
- **Why it's great**: Actual human-AI dialogues, not simulated

### 2. **OpenAssistant Conversations**
- **Source**: [HuggingFace](https://huggingface.co/datasets/OpenAssistant/oasst1) | [Paper](https://arxiv.org/abs/2304.07327)
- **Description**: 161,443 messages in 35 languages, fully annotated conversation trees
- **Size**: 10,000+ complete conversation trees
- **Quality**: Expert-annotated, quality-rated
- **Why it's great**: High-quality with quality metrics and annotations

### 3. **Chatbot Arena Conversations**
- **Source**: [Model Database](https://modeldatabase.com/datasets/lmsys/chatbot_arena_conversations.html)
- **Description**: 33,000 cleaned conversations with pairwise human preferences
- **Quality**: Includes user votes and preferences
- **Why it's great**: Real comparisons between different AI models

## Human-Human Datasets (Can be adapted)

### 4. **Cornell Movie-Dialogs Corpus** (Already Available!)
- **Source**: Currently in `temp-samantha/dataset/`
- **Description**: 220,579 conversational exchanges from movie scripts
- **Size**: 304,713 utterances from 617 movies
- **Format**: Character dialogues
- **Why it's useful**: Rich, contextual conversations (though fictional)

### 5. **Topical-Chat**
- **Source**: [HuggingFace](https://huggingface.co/datasets/allenai/topical_chat)
- **Description**: Knowledge-grounded conversations across 8 broad topics
- **Why it's useful**: Deep, topic-focused discussions

### 6. **EmpatheticDialogues**
- **Source**: [HuggingFace](https://huggingface.co/datasets/empathetic_dialogues)
- **Description**: 24,850 one-on-one conversations focused on empathy
- **Why it's useful**: Emotionally intelligent conversations

### 7. **MentalChat16K**
- **Source**: [HuggingFace](https://huggingface.co/datasets/mental-chat)
- **Description**: Mental health counseling dialogues
- **Why it's useful**: Deep, supportive, therapeutic conversations

## Research Datasets

### 8. **DICES Dataset** (Google Research)
- **Source**: [GitHub](https://github.com/google-research-datasets/dices-dataset)
- **Description**: Multi-turn adversarial conversations between humans and dialog models
- **Quality**: Safety-rated by diverse rater pools
- **Why it's useful**: Understanding safety perceptions and adversarial interactions

### 9. **DeepDialogue Dataset**
- **Source**: [Paper](https://arxiv.org/abs/2505.19978)
- **Description**: 40,000+ multi-turn dialogues across 41 domains with 20 emotions
- **Quality**: High-quality with emotional progressions
- **Why it's useful**: Emotionally nuanced, domain-specific conversations

## Quick Access Scripts

See `download-conversation-datasets.py` for automated downloading and processing.

---
lang: [en, zh-CN, ja, fr]
lang_view: en
tags: [example, recipe, multilingual]
---

# mi18n Demo — Matcha Latte Recipe

This note is open in English because of `lang_view: en` in the frontmatter.
It demonstrates **all features** of mi18n: four syntax styles, multi-language blocks, shared content, and frontmatter integration.

> Switch language: click the status bar badge, the ribbon icon, or use the reading-mode pill bar above.

---

## Shared content (always visible)

Text that lives **outside** any lang block is shown regardless of the active language.
This line is always visible. Use it for titles, metadata, or content that applies to all languages.

---

## Ingredients
*Syntax: fenced-div `:::lang` — default, recommended*

:::lang en
- 1 tsp ceremonial-grade matcha powder
- 2 tbsp hot water (80 °C / 175 °F — not boiling)
- 200 ml oat milk (or your preferred milk)
- 1 tsp honey or maple syrup (optional)
- Ice cubes (for iced version)
:::

:::lang zh-CN
- 1 茶匙仪式级抹茶粉
- 2 汤匙热水（80 °C — 不要沸腾）
- 200 毫升燕麦奶（或你喜欢的牛奶）
- 1 茶匙蜂蜜或枫糖浆（可选）
- 冰块（冰饮版本使用）
:::

:::lang ja
- 抹茶パウダー（儀式用）小さじ 1
- お湯 80 °C で大さじ 2（沸騰させないこと）
- オーツミルク（またはお好みのミルク）200 ml
- ハチミツまたはメープルシロップ 小さじ 1（お好みで）
- 氷（アイス版に使用）
:::

:::lang fr
- 1 c. à café de matcha en poudre de grade cérémoniel
- 2 c. à soupe d'eau chaude à 80 °C (pas bouillante)
- 200 ml de lait d'avoine (ou votre lait préféré)
- 1 c. à café de miel ou de sirop d'érable (facultatif)
- Glaçons (pour la version glacée)
:::

---

## Instructions
*Syntax: Hexo tag `{% lang %}` — visible markers, compatible with static-site generators*

{% lang en %}
1. Sift the matcha powder into a small bowl to remove lumps.
2. Add the hot water and whisk vigorously in a zigzag motion until frothy (~30 s). A bamboo chasen works best.
3. Heat the oat milk gently — do not boil. Froth if desired.
4. Pour the matcha over the milk.
5. Sweeten to taste and enjoy immediately.

**Iced version:** Pour matcha over a glass full of ice, then add cold oat milk.
{% endlang %}

{% lang zh-CN %}
1. 将抹茶粉过筛到小碗中，去除结块。
2. 加入热水，用茶筅或小打蛋器以锯齿状快速搅打约 30 秒，直至产生泡沫。
3. 轻轻加热燕麦奶，不要煮沸。如需奶泡，可使用打奶泡器。
4. 将抹茶倒入牛奶中。
5. 按口味加糖，立即享用。

**冰饮版本：** 将抹茶倒在装满冰块的杯子上，然后加入冷燕麦奶。
{% endlang %}

{% lang ja %}
1. 抹茶パウダーをふるいにかけて小さなボウルに入れ、ダマをなくします。
2. お湯を加え、茶筅でジグザグに素早く約 30 秒間泡立てます。
3. オーツミルクを優しく温めます（沸騰させないこと）。お好みでフォームを作ります。
4. 抹茶をミルクに注ぎます。
5. 甘さはお好みで調整し、すぐにお召し上がりください。

**アイス版：** 氷を入れたグラスに抹茶を注ぎ、冷たいオーツミルクを加えます。
{% endlang %}

{% lang fr %}
1. Tamisez la poudre de matcha dans un petit bol pour éviter les grumeaux.
2. Ajoutez l'eau chaude et fouettez vigoureusement en zigzag jusqu'à obtenir de la mousse (~30 s). Un chasen en bambou est idéal.
3. Chauffez doucement le lait d'avoine — ne faites pas bouillir. Faites mousser si désiré.
4. Versez le matcha sur le lait.
5. Sucrez à votre goût et dégustez immédiatement.

**Version glacée :** versez le matcha sur un verre plein de glaçons, puis ajoutez du lait d'avoine froid.
{% endlang %}

---

## Storage Tips
*Syntax: Markdown comment `[//]: # (lang …)` — **invisible** in reading mode*

[//]: # (lang en)
Store unused matcha in an airtight container away from light, heat, and moisture. Consume within 2–3 months of opening for best flavour.
[//]: # (endlang)

[//]: # (lang zh-CN)
将未使用的抹茶存放在密封容器中，避免光线、热量和潮湿。开封后 2–3 个月内使用效果最佳。
[//]: # (endlang)

[//]: # (lang ja)
使用しない抹茶は密閉容器に入れ、光・熱・湿気を避けて保管してください。開封後 2〜3 か月以内にお使いください。
[//]: # (endlang)

[//]: # (lang fr)
Conservez le matcha non utilisé dans un récipient hermétique, à l'abri de la lumière, de la chaleur et de l'humidité. Consommez dans les 2–3 mois suivant l'ouverture.
[//]: # (endlang)

---

## Notes
*Syntax: Obsidian comment `%% lang … %%` — **invisible** in reading mode **and** Live Preview*

%% lang en %%
Ceremonial-grade matcha is noticeably sweeter and less bitter than culinary-grade. If you only have culinary-grade, reduce the quantity slightly and add a touch more sweetener.
%% endlang %%

%% lang zh-CN %%
仪式级抹茶比烹饪级抹茶明显更甜、更不苦涩。如果只有烹饪级抹茶，请稍微减少用量，并适量增加甜味剂。
%% endlang %%

%% lang ja %%
儀式用抹茶は料理用抹茶に比べて甘みがあり、苦みが少ないのが特徴です。料理用しかない場合は量を少し減らし、甘味料を少し加えてください。
%% endlang %%

%% lang fr %%
Le matcha de grade cérémoniel est nettement plus doux et moins amer que le grade culinaire. Si vous n'avez que du grade culinaire, réduisez légèrement la quantité et ajoutez un peu plus de sucrant.
%% endlang %%

---

## Multi-language block demo
*One block assigned to multiple languages — shown when English **or** French is active*

:::lang en fr
This block is shared between English and French.
It appears whenever either language is active.
:::

:::lang zh-CN ja
此块同时属于中文和日文。
任意一种语言激活时均会显示。
このブロックは中国語と日本語の両方に属します。
:::

---

*Serves: 1 | Prep time: 5 minutes*

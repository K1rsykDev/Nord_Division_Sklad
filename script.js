const form = document.getElementById("reportForm");
const totalCount = document.getElementById("totalCount");
const statusEl = document.getElementById("status");

const items = Array.from(document.querySelectorAll("[data-item]"));

const getItemsData = () =>
  items.map((card) => {
    const title = card.querySelector("h3").textContent.trim();
    const quantity = Number(card.querySelector("[data-quantity]").value || 0);
    return { title, quantity };
  });

const updateTotal = () => {
  const total = getItemsData().reduce((sum, item) => sum + item.quantity, 0);
  totalCount.textContent = total.toString();
};

items.forEach((card) => {
  const input = card.querySelector("[data-quantity]");
  input.addEventListener("input", updateTotal);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "Відправка...";

  const formData = new FormData(form);
  const nickname = formData.get("nickname");
  const staticId = formData.get("staticId");
  const webhook = formData.get("webhook");

  const itemData = getItemsData().filter((item) => item.quantity > 0);
  const total = itemData.reduce((sum, item) => sum + item.quantity, 0);

  if (itemData.length === 0) {
    statusEl.textContent = "Оберіть хоча б один предмет.";
    return;
  }

  const fields = itemData.map((item) => ({
    name: item.title,
    value: `${item.quantity} од.`,
    inline: true,
  }));

  fields.push({
    name: "Загалом",
    value: `${total} од.`,
    inline: false,
  });

  const payload = {
    username: "Nord Division Sklad",
    embeds: [
      {
        title: "Звіт складу",
        color: 16098828,
        fields: [
          {
            name: "Нік",
            value: nickname,
            inline: true,
          },
          {
            name: "Static ID",
            value: staticId,
            inline: true,
          },
          ...fields,
        ],
        footer: {
          text: "Nord Division",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors",
      body: JSON.stringify(payload),
    });
    statusEl.textContent = "Звіт відправлено у Discord.";
    form.reset();
    updateTotal();
  } catch (error) {
    statusEl.textContent = "Помилка відправки. Спробуйте ще раз.";
  }
});

updateTotal();

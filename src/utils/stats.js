export function stats_add_count() {
  fetch("https://service.liuxs.pro/count/add", { method: "get" })
    .then((response) => response.json())
    .then((data) => {
      console.log("Count updated successfully:", data);
    })
    .catch((error) => {
      console.error("Error updating count:", error);
    });
}

export async function get_create_num() {
  const url = "https://service.liuxs.pro/count";
  const r = await fetch(url);
  const j = await r.json();
  return j.created_num;
}

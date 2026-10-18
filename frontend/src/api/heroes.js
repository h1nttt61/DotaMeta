export async function getHeroes(role = "ALL") {
    const url = role && role !== "ALL"
        ? `http://localhost:3000/api/heroes?role=${role}`
        : "http://localhost:3000/api/heroes";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Не удалось загрузить героев");
    }

    return response.json();
}
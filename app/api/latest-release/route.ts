export async function GET(request: Request) {
  try {
    const response = await fetch("https://codeberg.org/api/v1/repos/sker/sonixy/releases/latest", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return Response.json({ error: "Failed to fetch releases" }, { status: 502 });
    }

    const release = await response.json();
    const assets = release.assets || [];

    // Categorize binaries by platform
    const categorized = {
      Linux: [] as any[],
      macOS: [] as any[],
      Windows: [] as any[],
      Other: [] as any[],
    };

    assets.forEach((asset: any) => {
      const name = asset.name.toLowerCase();

      if (name.includes("-linux") || name.includes("linux_amd64") || name.endsWith(".deb") || name.endsWith(".rpm")) {
        categorized.Linux.push({ ...asset, category: "Linux" });
      } else if (name.includes("-macos") || name.includes(".dmg")) {
        categorized.macOS.push({ ...asset, category: "macOS" });
      } else if (name.includes("-windows") || name.includes("windows_amd64") || name.endsWith(".exe") || name.endsWith(".msi")) {
        categorized.Windows.push({ ...asset, category: "Windows" });
      } else {
        categorized.Other.push({ ...asset, category: "Other" });
      }
    });

    return Response.json({
      version: release.tag_name,
      binaries: categorized,
    });
  } catch (error) {
    console.error("Error fetching release:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

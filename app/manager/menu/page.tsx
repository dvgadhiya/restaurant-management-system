import { prisma } from "@/lib/prisma"
import { MenuList } from "@/components/manager/menu-list"
import { AddMenuItemDialog } from "@/components/manager/add-menu-item-dialog"

export default async function MenuPage() {
  const [categories, menuItems] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    }),
    prisma.menuItem.findMany({
      include: {
        category: true
      },
      orderBy: { name: "asc" }
    })
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant menu items and categories</p>
        </div>
        <AddMenuItemDialog categories={categories} />
      </div>

      <MenuList categories={categories} menuItems={menuItems} />
    </div>
  )
}

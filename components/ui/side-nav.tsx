import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarGroup,
	SidebarFooter,
} from '@/components/ui/sidebar';

export function SideNav() {
	return (
		<Sidebar>
			<SidebarHeader></SidebarHeader>
			<SidebarContent>
				<SidebarGroup />
				<SidebarGroup />
				<SidebarGroup />
			</SidebarContent>
			<SidebarFooter></SidebarFooter>
		</Sidebar>
	);
}

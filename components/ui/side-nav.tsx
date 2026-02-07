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
			<SidebarHeader>
				<SidebarContent>
					<SidebarGroup />
				</SidebarContent>
			</SidebarHeader>
			<SidebarFooter></SidebarFooter>
		</Sidebar>
	);
}

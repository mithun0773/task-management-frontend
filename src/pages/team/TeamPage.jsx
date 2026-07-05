import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "../../api/search";
import {
  Users,
  Mail,
  Shield,
  Briefcase,
  Search,
  FolderKanban,
  CheckSquare,
} from "lucide-react";

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ All authenticated users can fetch team stats
  const { data: teamStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ["team-stats"],
    queryFn: searchApi.getTeamStats,
  });

  const filteredMembers = teamStats.filter((member) =>
    `${member.first_name} ${member.last_name} ${member.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const stats = {
    total: teamStats.length,
    admins: teamStats.filter((u) => u.role === "ADMIN").length,
    projectManagers: teamStats.filter((u) => u.role === "PROJECT_MANAGER")
      .length,
    teamMembers: teamStats.filter((u) => u.role === "TEAM_MEMBER").length,
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            View your team and their workload
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={stats.total}
          icon={<Users size={20} />}
          color="indigo"
        />
        <StatCard
          label="Admins"
          value={stats.admins}
          icon={<Shield size={20} />}
          color="purple"
        />
        <StatCard
          label="Project Managers"
          value={stats.projectManagers}
          icon={<Briefcase size={20} />}
          color="blue"
        />
        <StatCard
          label="Team Members"
          value={stats.teamMembers}
          icon={<Users size={20} />}
          color="green"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No team members found
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function MemberCard({ member }) {
  const roleConfig = {
    ADMIN: {
      label: "Admin",
      color: "bg-purple-100 text-purple-700",
      icon: <Shield size={12} />,
    },
    PROJECT_MANAGER: {
      label: "Project Manager",
      color: "bg-blue-100 text-blue-700",
      icon: <Briefcase size={12} />,
    },
    TEAM_MEMBER: {
      label: "Team Member",
      color: "bg-green-100 text-green-700",
      icon: <Users size={12} />,
    },
  };

  const role = roleConfig[member.role] || roleConfig.TEAM_MEMBER;
  const initials =
    `${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {initials}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {member.first_name} {member.last_name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <Mail size={12} />
              <span className="truncate max-w-[180px]">{member.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${role.color}`}
        >
          {role.icon}
          {role.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
        {(member.role === "PROJECT_MANAGER" || member.role === "ADMIN") && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FolderKanban size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Projects</p>
              <p className="font-bold text-gray-900">{member.projectsCount}</p>
            </div>
          </div>
        )}

        {(member.role === "TEAM_MEMBER" || member.role === "ADMIN") && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckSquare size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tasks</p>
              <p className="font-bold text-gray-900">{member.tasksCount}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { getStorage, setStorage } from "../../../utils/storage";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import { Modal } from "../../../components/ui/modal";
import { useModal } from "../../../hooks/useModal";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import { Pagination } from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../../components/ui/table";
import { ChevronDownIcon, ChevronUpIcon } from "../../../icons";
import {
  FiEye,
  FiEdit,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import { initialClients, Client } from "../data/clientsData";

export default function ClientList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>(() =>
    getStorage("saiflow_clients", initialClients)
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Client>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown states
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Delete modal
  const deleteModal = useModal();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleOpenDelete = (client: Client) => {
    setSelectedClient(client);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedClient) {
      const updated = clients.filter((c) => c.id !== selectedClient.id);
      setClients(updated);
      setStorage("saiflow_clients", updated);
      showToast("Client deleted successfully.", "success");
    }
    deleteModal.closeModal();
  };

  // Processing
  const processedClients = useMemo(() => {
    let result = [...clients];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.company.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [clients, searchQuery, statusFilter, sortField, sortOrder]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedClients.slice(start, start + rowsPerPage);
  }, [processedClients, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedClients.length / rowsPerPage);

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta
        title="Client Management | SaiFlow"
        description="View and manage all your corporate clients in SaiFlow CRM & ERP."
      />
      <PageBreadcrumb pageTitle="Client Management" />

      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center justify-between h-11 w-44 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span className="truncate text-left flex-1">{statusFilter === "all" ? "All Statuses" : statusFilter}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0 ml-2" />
            </button>
            <Dropdown
              isOpen={isStatusFilterOpen}
              onClose={() => setIsStatusFilterOpen(false)}
              className="left-0 w-40 p-1 mt-2"
            >
              <ul className="flex flex-col gap-0.5">
                <li>
                  <DropdownItem
                    onItemClick={() => {
                      setStatusFilter("all");
                      setCurrentPage(1);
                      setIsStatusFilterOpen(false);
                    }}
                    className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${
                      statusFilter === "all" ? "bg-brand-500 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                    }`}
                  >
                    All Statuses
                  </DropdownItem>
                </li>
                {["Active", "Inactive", "Blacklisted"].map((st) => (
                  <li key={st}>
                    <DropdownItem
                      onItemClick={() => {
                        setStatusFilter(st);
                        setCurrentPage(1);
                        setIsStatusFilterOpen(false);
                      }}
                      className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${
                        statusFilter === st ? "bg-brand-500 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                      }`}
                    >
                      {st}
                    </DropdownItem>
                  </li>
                ))}
              </ul>
            </Dropdown>
          </div>
        </div>
        <Button onClick={() => navigate("/clients/add")} variant="primary" size="sm" startIcon={<FiPlus />}>
          Add Client
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <th className="px-5 py-3 text-start text-theme-xs font-semibold text-gray-500 dark:text-gray-400">
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1">
                    Client Name {sortField === "name" && (sortOrder === "asc" ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="px-5 py-3 text-start text-theme-xs font-semibold text-gray-500 dark:text-gray-400">
                  <button onClick={() => handleSort("company")} className="flex items-center gap-1">
                    Company {sortField === "company" && (sortOrder === "asc" ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="px-5 py-3 text-start text-theme-xs font-semibold text-gray-500 dark:text-gray-400">Email</th>
                <th className="px-5 py-3 text-start text-theme-xs font-semibold text-gray-500 dark:text-gray-400">Phone</th>
                <th className="px-5 py-3 text-start text-theme-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Projects</th>
                <th className="px-5 py-3 text-start text-theme-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-5 py-3 text-end text-theme-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <TableRow key={client.id} className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-55/50 dark:hover:bg-white/[0.01]">
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{client.name}</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">{client.company}</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">{client.email}</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">{client.phone}</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400 text-center font-semibold">{client.projectsCount}</TableCell>
                    <TableCell className="px-5 py-4 text-sm">
                      <Badge color={client.status === "Active" ? "success" : client.status === "Blacklisted" ? "error" : "warning"}>{client.status}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-end">
                      <div className="flex justify-end items-center gap-2">
                        <button onClick={() => navigate(`/clients/${client.id}`)} className="text-gray-500 hover:text-brand-500 p-1"><FiEye size={16} /></button>
                        <button onClick={() => navigate(`/clients/${client.id}/edit`)} className="text-gray-500 hover:text-warning-500 p-1"><FiEdit size={16} /></button>
                        <button onClick={() => handleOpenDelete(client)} className="text-gray-500 hover:text-error-500 p-1"><FiTrash2 size={16} /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                    No clients found matching the query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {processedClients.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={processedClients.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
          itemName="clients"
        />
      )}

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} className="max-w-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Delete Client</h4>
        <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete client "{selectedClient?.name}"? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button onClick={deleteModal.closeModal} variant="outline" size="sm">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="primary" className="bg-error-600 hover:bg-error-700 border-error-600 text-white" size="sm">Delete</Button>
        </div>
      </Modal>
    </>
  );
}

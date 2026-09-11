import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Truck,
  ArrowRight,
  ShieldAlert,
  Clock,
  Thermometer
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { shipmentService, districtService, vehicleService } from '../../services/domainServices';
import { formatDate } from '../../utils/formatters';

export function ShipmentList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [cargoFilter, setCargoFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State for new shipment dispatch
  const [title, setTitle] = useState('');
  const [originDistrictId, setOriginDistrictId] = useState('AS-KAM');
  const [destinationDistrictId, setDestinationDistrictId] = useState('ML-EKH');
  const [cargoType, setCargoType] = useState('Medicines');
  const [priority, setPriority] = useState('critical');
  const [assignedVehicleId, setAssignedVehicleId] = useState('NER-CONVOY-101');
  const [tempRequirementC, setTempRequirementC] = useState('2°C to 8°C');

  const { data: shipmentsData } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => shipmentService.getShipments()
  });

  const { data: districtsData } = useQuery({
    queryKey: ['districts'],
    queryFn: () => districtService.getDistricts()
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleService.getVehicles()
  });

  const shipments = shipmentsData?.data || [];
  const districts = districtsData?.data || [];
  const vehicles = vehiclesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => shipmentService.createShipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      setModalOpen(false);
      setTitle('');
    }
  });

  const handleCreateShipment = (e) => {
    e.preventDefault();
    const orig = districts.find(d => d.districtId === originDistrictId);
    const dest = districts.find(d => d.districtId === destinationDistrictId);

    createMutation.mutate({
      title,
      originDistrictId,
      originName: orig?.name || 'Guwahati Hub',
      destinationDistrictId,
      destinationName: dest?.name || 'Destination Staging',
      cargoType,
      priority,
      assignedVehicleId,
      tempRequirementC
    });
  };

  const filteredShipments = shipments.filter((shp) => {
    const matchesSearch =
      shp.shipmentId?.toLowerCase().includes(search.toLowerCase()) ||
      shp.title?.toLowerCase().includes(search.toLowerCase()) ||
      shp.destinationName?.toLowerCase().includes(search.toLowerCase());
    const matchesCargo = cargoFilter === 'all' || shp.cargoType === cargoFilter;
    const matchesPriority = priorityFilter === 'all' || shp.priority === priorityFilter;
    return matchesSearch && matchesCargo && matchesPriority;
  });

  return (
    <PageShell
      title="Consignment Tracking & Cargo Manifest"
      subtitle="Chain-of-custody tracking for medicines, emergency rations, and relief cargo across North East corridors"
      breadcrumbs={['Dashboard', 'Consignments']}
      actionSlot={
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={Plus}>
          Schedule Consignment Dispatch
        </Button>
      }
    >
      {/* Search & Filters */}
      <Card className="p-4 border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Input
              placeholder="Search shipment ID, destination, cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              value={cargoFilter}
              onChange={(e) => setCargoFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Cargo Types' },
                { value: 'Medicines', label: 'Medicines & Vaccines' },
                { value: 'Food Supplies', label: 'Food Grain & Rations' },
                { value: 'Heavy Equipment', label: 'Heavy Equipment' },
                { value: 'Agricultural Produce', label: 'Agricultural Produce' }
              ]}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'critical', label: 'Critical / Life-Saving' },
                { value: 'high', label: 'High Priority' },
                { value: 'standard', label: 'Standard Schedule' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Manifest Table */}
      <Card>
        <Table headers={['Shipment ID', 'Consignment Title', 'Origin → Destination', 'Cargo Type', 'Priority', 'Vehicle', 'Temp Req', 'Status']}>
          {filteredShipments.map((shp) => (
            <TableRow key={shp.shipmentId} onClick={() => navigate(`/shipments/${shp.shipmentId}`)}>
              <TableCell className="font-mono font-bold text-sky-400">{shp.shipmentId}</TableCell>
              <TableCell className="font-semibold text-slate-100">{shp.title}</TableCell>
              <TableCell className="text-slate-300">
                {shp.originName} → <b className="text-slate-100">{shp.destinationName}</b>
              </TableCell>
              <TableCell>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-medium">
                  {shp.cargoType}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={shp.priority === 'critical' ? 'danger' : shp.priority === 'high' ? 'warning' : 'default'} size="sm">
                  {shp.priority}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-slate-300">{shp.assignedVehicleId || 'Unassigned'}</TableCell>
              <TableCell className="font-mono text-cyan-400 text-[11px]">{shp.tempRequirementC || 'Ambient'}</TableCell>
              <TableCell>
                <Badge variant={shp.status === 'rerouted' ? 'warning' : 'safe'} size="sm" pulsing={shp.status === 'in_transit'}>
                  {shp.status?.replace('_', ' ')}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>

      {/* Schedule Dispatch Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule New Consignment Dispatch"
      >
        <form onSubmit={handleCreateShipment} className="space-y-4">
          <Input
            label="Consignment Title / Description"
            placeholder="e.g. Life-saving Insulin & Anti-Venom Kits"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Origin Hub"
              value={originDistrictId}
              onChange={(e) => setOriginDistrictId(e.target.value)}
              options={districts.map(d => ({ value: d.districtId, label: d.name }))}
            />
            <Select
              label="Destination Staging"
              value={destinationDistrictId}
              onChange={(e) => setDestinationDistrictId(e.target.value)}
              options={districts.map(d => ({ value: d.districtId, label: d.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Cargo Classification"
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              options={[
                { value: 'Medicines', label: 'Medicines & Vaccines' },
                { value: 'Food Supplies', label: 'Food Supplies' },
                { value: 'Heavy Equipment', label: 'Heavy Equipment' },
                { value: 'Agricultural Produce', label: 'Agricultural Produce' }
              ]}
            />
            <Select
              label="Convoy Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'critical', label: 'Critical Emergency' },
                { value: 'high', label: 'High Priority' },
                { value: 'standard', label: 'Standard Schedule' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assign Fleet Vehicle"
              value={assignedVehicleId}
              onChange={(e) => setAssignedVehicleId(e.target.value)}
              options={vehicles.map(v => ({ value: v.vehicleId, label: `${v.vehicleId} (${v.type})` }))}
            />
            <Input
              label="Temperature Target"
              value={tempRequirementC}
              onChange={(e) => setTempRequirementC(e.target.value)}
              placeholder="e.g. 2°C to 8°C"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={createMutation.isPending}
            className="w-full"
            icon={Truck}
          >
            Authorize & Dispatch Convoy
          </Button>
        </form>
      </Modal>
    </PageShell>
  );
}

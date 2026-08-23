// Seed sample data to Firestore using fetch and REST API
const projectId = 'civicconnect-defca';
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

async function seed() {
  console.log('Seeding initial documents into Firestore for ' + projectId);

  // 1. Seed demo citizen
  const userPayload = {
    fields: {
      id: { stringValue: 'citizen-demo-001' },
      fullName: { stringValue: 'Demo Citizen' },
      username: { stringValue: 'citizen' },
      email: { stringValue: 'citizen@example.com' },
      phone: { stringValue: '+919876543210' },
      role: { stringValue: 'citizen' },
      password: { stringValue: 'Citizen@123' },
      createdAt: { stringValue: new Date().toISOString() }
    }
  };

  const userRes = await fetch(`${baseUrl}/users/citizen-demo-001`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPayload)
  });
  console.log('User Seed Status:', userRes.status);

  // 2. Seed demo complaints
  const complaints = [
    {
      id: 'cmp-seed-1001',
      complaintNumber: 'CMP-1001',
      citizenId: 'citizen-demo-001',
      citizenName: 'Demo Citizen',
      citizenPhone: '+919876543210',
      category: 'pothole',
      description: 'Major deep pothole near Metro Pillar 42 causing traffic slowdown.',
      address: 'Metro Pillar 42, Ring Road',
      latitude: 28.6139,
      longitude: 77.2090,
      status: 'assigned',
      workerId: 'worker-002',
      workerName: 'Suresh Patel (Road Maintenance)',
      workerPhone: '+919876543202',
      departmentName: 'Road Maintenance',
      upvotesCount: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'cmp-seed-1002',
      complaintNumber: 'CMP-1002',
      citizenId: 'citizen-demo-001',
      citizenName: 'Demo Citizen',
      citizenPhone: '+919876543210',
      category: 'garbage',
      description: 'Garbage bins overflowing near Sector 5 community center.',
      address: 'Sector 5 Community Center',
      latitude: 28.6145,
      longitude: 77.2095,
      status: 'submitted',
      upvotesCount: 1,
      createdAt: new Date().toISOString()
    }
  ];

  for (const c of complaints) {
    const docPayload = {
      fields: {
        id: { stringValue: c.id },
        complaintNumber: { stringValue: c.complaintNumber },
        citizenId: { stringValue: c.citizenId },
        citizenName: { stringValue: c.citizenName },
        citizenPhone: { stringValue: c.citizenPhone },
        category: { stringValue: c.category },
        description: { stringValue: c.description },
        address: { stringValue: c.address },
        latitude: { doubleValue: c.latitude },
        longitude: { doubleValue: c.longitude },
        status: { stringValue: c.status },
        workerId: c.workerId ? { stringValue: c.workerId } : { nullValue: null },
        workerName: c.workerName ? { stringValue: c.workerName } : { nullValue: null },
        workerPhone: c.workerPhone ? { stringValue: c.workerPhone } : { nullValue: null },
        departmentName: c.departmentName ? { stringValue: c.departmentName } : { nullValue: null },
        upvotesCount: { integerValue: c.upvotesCount },
        createdAt: { stringValue: c.createdAt }
      }
    };

    const res = await fetch(`${baseUrl}/complaints/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docPayload)
    });
    console.log(`Complaint ${c.complaintNumber} Status:`, res.status);
  }

  console.log('Finished seeding Firestore collections: users and complaints!');
}

seed();

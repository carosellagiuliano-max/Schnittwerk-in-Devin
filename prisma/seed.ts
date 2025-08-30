import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main(){
  const t = await db.tenant.upsert({
    where:{ id:'t_dev' }, update:{},
    create:{ id:'t_dev', name:'Dev Salon', domain:'localhost', plan:'free', theme:null }
  })
  await db.profile.upsert({
    where:{ tenantId_email:{ tenantId:t.id, email:'admin@dev.local' } },
    update:{},
    create:{ tenantId:t.id, email:'admin@dev.local', role:'owner', fullName:'Dev Admin' }
  })
  console.log('Seed OK')
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})

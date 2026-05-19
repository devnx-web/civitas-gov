-- Wave 4A: grupos/classes/subclasses de material (Portaria STN 448/2002)
-- + coluna subclasseId em materiais

CREATE TABLE "grupos_material" (
    "id"           TEXT NOT NULL,
    "tenantId"     TEXT NOT NULL,
    "codigo"       TEXT NOT NULL,
    "nome"         TEXT NOT NULL,
    "ativo"        BOOLEAN NOT NULL DEFAULT true,
    "criadoEm"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_material_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "classes_material" (
    "id"           TEXT NOT NULL,
    "grupoId"      TEXT NOT NULL,
    "codigo"       TEXT NOT NULL,
    "nome"         TEXT NOT NULL,
    "ativo"        BOOLEAN NOT NULL DEFAULT true,
    "criadoEm"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_material_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subclasses_material" (
    "id"           TEXT NOT NULL,
    "classeId"     TEXT NOT NULL,
    "codigo"       TEXT NOT NULL,
    "nome"         TEXT NOT NULL,
    "ativo"        BOOLEAN NOT NULL DEFAULT true,
    "criadoEm"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subclasses_material_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "grupos_material_tenantId_codigo_key"   ON "grupos_material"("tenantId", "codigo");
CREATE UNIQUE INDEX "classes_material_grupoId_codigo_key"   ON "classes_material"("grupoId", "codigo");
CREATE UNIQUE INDEX "subclasses_material_classeId_codigo_key" ON "subclasses_material"("classeId", "codigo");

-- Indexes
CREATE INDEX "grupos_material_tenantId_idx"      ON "grupos_material"("tenantId");
CREATE INDEX "classes_material_grupoId_idx"      ON "classes_material"("grupoId");
CREATE INDEX "subclasses_material_classeId_idx"  ON "subclasses_material"("classeId");

-- Foreign keys
ALTER TABLE "grupos_material"
    ADD CONSTRAINT "grupos_material_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "classes_material"
    ADD CONSTRAINT "classes_material_grupoId_fkey"
    FOREIGN KEY ("grupoId") REFERENCES "grupos_material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subclasses_material"
    ADD CONSTRAINT "subclasses_material_classeId_fkey"
    FOREIGN KEY ("classeId") REFERENCES "classes_material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add subclasseId to materiais
ALTER TABLE "materiais" ADD COLUMN "subclasseId" TEXT;

ALTER TABLE "materiais"
    ADD CONSTRAINT "materiais_subclasseId_fkey"
    FOREIGN KEY ("subclasseId") REFERENCES "subclasses_material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

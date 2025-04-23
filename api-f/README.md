

    -- Tabla de integraciones

CREATE  TABLE  integrations (

id VARCHAR(255) PRIMARY KEY, -- corresponde a "id" en integrations.json

name  VARCHAR(255) NOT NULL,

uuid UUID,

description  TEXT

);

  

-- Tabla de campañas

CREATE  TABLE  campaigns (

id VARCHAR(255) PRIMARY KEY, -- corresponde a "id" en campaigns.json

interpress_id VARCHAR(255),

stix_id VARCHAR(255),

name  VARCHAR(255) NOT NULL,

description  TEXT,

deprecated BOOLEAN,

revoked BOOLEAN,

created_timestamp TIMESTAMPTZ,

modified_timestamp TIMESTAMPTZ,

origin VARCHAR(255),

first_seen_timestamp TIMESTAMPTZ,

last_seen_timestamp TIMESTAMPTZ,

techniques_count INTEGER,

software_count INTEGER,

threat_groups_count INTEGER

);

-- Tabla de países
CREATE TABLE countries (
value VARCHAR(255) PRIMARY KEY, -- corresponde a "value" en countries.json
label VARCHAR(255) NOT NULL
);

-- Tabla de industrias
CREATE TABLE industries (
value VARCHAR(255) PRIMARY KEY, -- corresponde a "value" en industries.json
label VARCHAR(255) NOT NULL
);
  

-- Tabla de detecciones

CREATE  TABLE  detections (

id VARCHAR(255) PRIMARY KEY, -- corresponde a "id" en detections.json

name  TEXT  NOT NULL,

description  TEXT,

created_timestamp TIMESTAMPTZ,

modified_timestamp TIMESTAMPTZ,

state  VARCHAR(50),

definition_source VARCHAR(50),

verified BOOLEAN,

prevention BOOLEAN,

severity VARCHAR(50),

reference_id VARCHAR(255),

license TEXT,

author TEXT,

logic TEXT,

state_change_timestamp TIMESTAMPTZ,

indicators_count INTEGER,

techniques_count INTEGER,

stix_id VARCHAR(255),

type  VARCHAR(255),

integration_name VARCHAR(255), -- tal cual viene en detections.json

notional BOOLEAN,

software_count INTEGER,

threat_groups_count INTEGER

);

  

-- Tabla de plataformas

CREATE  TABLE  platforms (

id VARCHAR(255) PRIMARY KEY, -- "id" en platforms.json

name  VARCHAR(255) NOT NULL,

description  TEXT

);

  

-- Tabla de software

CREATE  TABLE  software (

id VARCHAR(255) PRIMARY KEY, -- "id" en software.json

name  VARCHAR(255) NOT NULL,

description  TEXT

);

  

-- Tabla de tácticas

CREATE  TABLE  tactics (

mitre_id VARCHAR(50) PRIMARY KEY, -- "mitreId" en tactics.json

name  VARCHAR(255) NOT NULL,

description  TEXT

);

  

-- Tabla de técnicas

CREATE  TABLE  techniques (

mitre_id VARCHAR(50) PRIMARY KEY, -- "mitreId" en techniques.json

id_json VARCHAR(255) UNIQUE, -- "id" original (base64)

stix_id VARCHAR(255),

name  VARCHAR(255) NOT NULL,

description  TEXT,

priority INTEGER,

universal_priority INTEGER,

content INTEGER,

subtechnique BOOLEAN,

deprecated BOOLEAN,

created_timestamp TIMESTAMPTZ,

modified_timestamp TIMESTAMPTZ,

update_flag BOOLEAN  -- renombrado de "update"

);

  

-- Tabla de grupos de amenazas

CREATE  TABLE  threat_groups (

id VARCHAR(255) PRIMARY KEY, -- "id" en threatGroups.json

name  VARCHAR(255) NOT NULL,

description  TEXT

);

  

-- Tabla de vulnerabilidades

CREATE  TABLE  vulnerabilities (

id VARCHAR(255) PRIMARY KEY, -- "id" en vulnerabilities.json

stix_id VARCHAR(255),

name  VARCHAR(255),

title TEXT,

description  TEXT,

cve_id VARCHAR(20) UNIQUE,

universal_priority INTEGER,

awareness_level VARCHAR(50),

cvss_severity_score REAL,

cvss_severity_score_version VARCHAR(10),

nist_impact_score REAL,

nist_exploitability_score REAL,

epss_exploitability_score REAL,

epss_exploitability_percentile REAL,

assets_count INTEGER

);

  

-- Tabla de mapeo de estándares de seguridad y técnicas (desde ttp-rel-standard.json)

CREATE  TABLE  security_standard_mappings (

id_mitre VARCHAR(50) PRIMARY KEY, -- corresponde a "idMitre", referencia a techniques.mitre_id

id_standard VARCHAR(255),

standard  VARCHAR(255),

control_id VARCHAR(50),

control_name VARCHAR(255),

technique_name VARCHAR(255),

description  TEXT,

FOREIGN KEY(id_mitre) REFERENCES techniques(mitre_id) ON DELETE CASCADE

);

  

-- Tablas de unión para campañas

CREATE  TABLE  campaign_software (

campaign_id VARCHAR(255) REFERENCES campaigns(id) ON DELETE CASCADE,

software_id VARCHAR(255) REFERENCES software(id) ON DELETE CASCADE,

PRIMARY KEY (campaign_id, software_id)

);

  

CREATE  TABLE  campaign_technique (

campaign_id VARCHAR(255) REFERENCES campaigns(id) ON DELETE CASCADE,

technique_id VARCHAR(50) REFERENCES techniques(mitre_id) ON DELETE CASCADE,

PRIMARY KEY (campaign_id, technique_id)

);

  

CREATE  TABLE  campaign_threat_group (

campaign_id VARCHAR(255) REFERENCES campaigns(id) ON DELETE CASCADE,

threat_group_id VARCHAR(255) REFERENCES threat_groups(id) ON DELETE CASCADE,

PRIMARY KEY (campaign_id, threat_group_id)

);

  

CREATE  TABLE  campaign_vulnerability (

campaign_id VARCHAR(255) REFERENCES campaigns(id) ON DELETE CASCADE,

vulnerability_id VARCHAR(255) REFERENCES vulnerabilities(id) ON DELETE CASCADE,

PRIMARY KEY (campaign_id, vulnerability_id)

);

-- Tablas de unión para campañas con industrias y países
CREATE TABLE campaign_industry (
campaign_id VARCHAR(255) REFERENCES campaigns(id) ON DELETE CASCADE,
industry_id VARCHAR(255) REFERENCES industries(value) ON DELETE CASCADE,
PRIMARY KEY (campaign_id, industry_id)
);

CREATE TABLE campaign_country (
campaign_id VARCHAR(255) REFERENCES campaigns(id) ON DELETE CASCADE,
country_id VARCHAR(255) REFERENCES countries(value) ON DELETE CASCADE,
PRIMARY KEY (campaign_id, country_id)
);
  

-- Tablas de unión para técnicas

CREATE  TABLE  technique_detection (

technique_id VARCHAR(50) REFERENCES techniques(mitre_id) ON DELETE CASCADE,

detection_id VARCHAR(255) REFERENCES detections(id) ON DELETE CASCADE,

effectiveness INTEGER,

PRIMARY KEY (technique_id, detection_id)

);

  

CREATE  TABLE  technique_platform (

technique_id VARCHAR(50) REFERENCES techniques(mitre_id) ON DELETE CASCADE,

platform_id VARCHAR(255) REFERENCES platforms(id) ON DELETE CASCADE,

PRIMARY KEY (technique_id, platform_id)

);

  

CREATE  TABLE  technique_software (

technique_id VARCHAR(50) REFERENCES techniques(mitre_id) ON DELETE CASCADE,

software_id VARCHAR(255) REFERENCES software(id) ON DELETE CASCADE,

PRIMARY KEY (technique_id, software_id)

);

  

CREATE  TABLE  technique_tactic (

technique_id VARCHAR(50) REFERENCES techniques(mitre_id) ON DELETE CASCADE,

tactic_id VARCHAR(50) REFERENCES tactics(mitre_id) ON DELETE CASCADE,

PRIMARY KEY (technique_id, tactic_id)

);

  

-- Tabla de unión para grupos de amenazas y técnicas

CREATE  TABLE  threat_group_technique (

threat_group_id VARCHAR(255) REFERENCES threat_groups(id) ON DELETE CASCADE,

technique_id VARCHAR(50) REFERENCES techniques(mitre_id) ON DELETE CASCADE,

PRIMARY KEY (threat_group_id, technique_id)

);

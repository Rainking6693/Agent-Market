'use client';

import { useMutation } from '@tanstack/react-query';
import { Loader2, CheckCircle2, ArrowRight, AlertCircle, Upload, FileText, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useRef, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { agentsApi, testingApi, type CreateAgentPayload, type AgentBudgetPayload } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

const steps = [
  {
    key: 'details',
    title: 'Agent details',
    description: 'Name, description, and visibility',
  },
  {
    key: 'capabilities',
    title: 'Capabilities & pricing',
    description: 'Categories, skills, pricing model',
  },
  {
    key: 'schemas',
    title: 'AP2 schema',
    description: 'Endpoint and IO contracts',
  },
  {
    key: 'budgets',
    title: 'Budgets & guardrails',
    description: 'Wallet controls and approvals',
  },
] as const;

const categoryOptions = ['sales', 'marketing', 'support', 'operations', 'finance', 'product'];
const capabilityOptions = [
  'lead_generation',
  'quality_review',
  'workflow_orchestration',
  'research',
  'data_analysis',
  'comms',
  'spec_writing',
  'security_review',
];
const pricingModels = [
  { value: 'per_execution', label: 'Per execution' },
  { value: 'per_lead', label: 'Per lead' },
  { value: 'retainer', label: 'Retainer' },
  { value: 'usage_based', label: 'Usage based' },
];

type Visibility = 'PUBLIC' | 'PRIVATE';

export default function NewAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);

  const [currentStep, setCurrentStep] = useState(0);
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [selectedCategories, setSelectedCategories] = useState<string[]>(['sales']);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(['lead_generation']);
  const [customCapability, setCustomCapability] = useState('');
  const [pricingModel, setPricingModel] = useState(pricingModels[0]?.value ?? 'per_execution');
  const [basePrice, setBasePrice] = useState('250');

  const [ap2Endpoint, setAp2Endpoint] = useState('');
  const [inputSchemaText, setInputSchemaText] = useState(
    JSON.stringify(
      {
        type: 'object',
        properties: {
          objective: { type: 'string' },
          budget: { type: 'number' },
        },
        required: ['objective'],
      },
      null,
      2,
    ),
  );
  const [outputSchemaText, setOutputSchemaText] = useState(
    JSON.stringify(
      {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          attachments: { type: 'array', items: { type: 'string' } },
        },
      },
      null,
      2,
    ),
  );
  const [schemaErrors, setSchemaErrors] = useState<{ input?: string; output?: string }>({});

  const [monthlyLimit, setMonthlyLimit] = useState('500');
  const [perTransactionLimit, setPerTransactionLimit] = useState('150');
  const [approvalThreshold, setApprovalThreshold] = useState('50');
  const [autoReload, setAutoReload] = useState(true);
  const [runBaselineAfterDeploy, setRunBaselineAfterDeploy] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [createdAgent, setCreatedAgent] = useState<{
    id: string;
    slug: string;
    name: string;
  } | null>(null);
  const [importedConfig, setImportedConfig] = useState<{
    name?: string;
    description?: string;
    categories?: string[];
    tags?: string[];
    pricingModel?: string;
    basePriceCents?: number;
    visibility?: Visibility;
    ap2Endpoint?: string;
    inputSchema?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const creationMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('You must be signed in to create agents.');
      }

      const inputSchema = parseSchema(inputSchemaText, 'input');
      const outputSchema = parseSchema(outputSchemaText, 'output');

      setSchemaErrors({
        input: inputSchema.error,
        output: outputSchema.error,
      });

      if (inputSchema.error || outputSchema.error) {
        throw new Error('Fix schema validation errors to continue.');
      }

      const basePriceNumber = normalizeCurrency(basePrice);

      const payload: CreateAgentPayload = {
        name: name.trim(),
        description: description.trim(),
        categories: selectedCategories,
        tags: selectedCapabilities,
        pricingModel,
        visibility,
        basePriceCents:
          basePriceNumber !== undefined ? Math.round(basePriceNumber * 100) : undefined,
        inputSchema: inputSchema.value,
        outputSchema: outputSchema.value,
        ap2Endpoint: ap2Endpoint.trim() || undefined,
        creatorId: user.id,
      };

      const agent = await agentsApi.create(payload);

      // Only update budget if user provided values
      const monthlyLimitValue = normalizeCurrency(monthlyLimit);
      if (monthlyLimitValue !== undefined || perTransactionLimit || approvalThreshold) {
        const budgetPayload: AgentBudgetPayload = {
          monthlyLimit: monthlyLimitValue ?? 500, // Default to $500/month
          perTransactionLimit: normalizeCurrency(perTransactionLimit) ?? null,
          approvalThreshold: normalizeCurrency(approvalThreshold) ?? null,
          autoReload,
        };

        await agentsApi.updateBudget(agent.id, budgetPayload);
      }
      return agent;
    },
    onSuccess: async (agent) => {
      setCreatedAgent({ id: agent.id, slug: agent.slug, name: agent.name });
      setErrorMessage('');

      // Run baseline test suite if enabled
      if (runBaselineAfterDeploy) {
        try {
          // Get the swarm baseline suite
          const suites = await testingApi.getRecommendedSuites();
          const baselineSuite = suites.find((s) => s.slug === 'swarm_smoke_test');
          
          if (baselineSuite) {
            await testingApi.startRun({
              agentId: agent.id,
              suiteId: baselineSuite.id,
            });
          }
        } catch (error) {
          console.error('Failed to start baseline test run:', error);
          // Don't show error to user - this is a background operation
        }
      }
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : 'Unable to create agent. Please try again.';
      setErrorMessage(message);
    },
  });

  const stepComplete = (index: number) => index < currentStep;
  const stepActive = (index: number) => index === currentStep;

  const canAdvance = useMemo(() => {
    switch (currentStep) {
      case 0:
        return name.trim().length >= 3 && description.trim().length >= 20;
      case 1:
        return selectedCategories.length > 0 && pricingModel.length > 0;
      case 2:
        return ap2Endpoint.trim().length > 0;
      case 3:
        return true; // Budget is optional - defaults to $500/month
      default:
        return false;
    }
  }, [currentStep, name, description, selectedCategories, pricingModel, ap2Endpoint]);

  // Auto-open file picker if ?import=true is in the URL
  useEffect(() => {
    if (searchParams.get('import') === 'true' && fileInputRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    }
  }, [searchParams]);

  const disableNav = creationMutation.isPending;

  // Handle file upload and import
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    try {
      const text = await file.text();
      let config: Record<string, unknown>;

      // Try to parse as JSON first, then YAML
      if (file.name.endsWith('.json') || file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
        try {
          config = JSON.parse(text);
        } catch (parseError) {
          throw new Error(
            `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Invalid JSON format'}. Please ensure your file is valid JSON.`,
          );
        }
      } else {
        throw new Error('Unsupported file type. Please upload a .json file.');
      }

      // Validate and map the imported config to form fields
      if (typeof config !== 'object' || config === null || Array.isArray(config)) {
        throw new Error('Invalid configuration file format. Expected a JSON object.');
      }

      console.log('Parsed config:', config);

      const imported: typeof importedConfig = {};
      let fieldsPopulated = 0;

      // Map config fields to form state
      if (typeof config.name === 'string' && config.name.trim()) {
        imported.name = config.name.trim();
        setName(config.name.trim());
        fieldsPopulated++;
      }

      if (typeof config.description === 'string' && config.description.trim()) {
        imported.description = config.description.trim();
        setDescription(config.description.trim());
        fieldsPopulated++;
      }

      if (Array.isArray(config.categories) && config.categories.length > 0) {
        imported.categories = config.categories.filter((c): c is string => typeof c === 'string');
        if (imported.categories.length > 0) {
          setSelectedCategories(imported.categories);
          fieldsPopulated++;
        }
      }

      if (Array.isArray(config.tags) && config.tags.length > 0) {
        imported.tags = config.tags.filter((t): t is string => typeof t === 'string');
        if (imported.tags.length > 0) {
          setSelectedCapabilities(imported.tags);
          fieldsPopulated++;
        }
      }

      if (typeof config.pricingModel === 'string' && config.pricingModel.trim()) {
        imported.pricingModel = config.pricingModel.trim();
        setPricingModel(config.pricingModel.trim());
        fieldsPopulated++;
      }

      if (typeof config.basePriceCents === 'number' && config.basePriceCents >= 0) {
        imported.basePriceCents = config.basePriceCents;
        setBasePrice(String(config.basePriceCents / 100));
        fieldsPopulated++;
      } else if (typeof config.basePrice === 'number' && config.basePrice >= 0) {
        // Also support basePrice in dollars
        setBasePrice(String(config.basePrice));
        fieldsPopulated++;
      }

      if (config.visibility === 'PUBLIC' || config.visibility === 'PRIVATE') {
        imported.visibility = config.visibility;
        setVisibility(config.visibility);
        fieldsPopulated++;
      }

      if (typeof config.ap2Endpoint === 'string' && config.ap2Endpoint.trim()) {
        imported.ap2Endpoint = config.ap2Endpoint.trim();
        setAp2Endpoint(config.ap2Endpoint.trim());
        fieldsPopulated++;
      }

      if (config.inputSchema && typeof config.inputSchema === 'object' && !Array.isArray(config.inputSchema)) {
        imported.inputSchema = config.inputSchema as Record<string, unknown>;
        setInputSchemaText(JSON.stringify(config.inputSchema, null, 2));
        fieldsPopulated++;
      }

      if (config.outputSchema && typeof config.outputSchema === 'object' && !Array.isArray(config.outputSchema)) {
        imported.outputSchema = config.outputSchema as Record<string, unknown>;
        setOutputSchemaText(JSON.stringify(config.outputSchema, null, 2));
        fieldsPopulated++;
      }

      setImportedConfig(imported);

      console.log(`Imported ${fieldsPopulated} field(s) from config`);

      if (fieldsPopulated === 0) {
        throw new Error(
          'No valid fields found in the configuration file. Please check that your JSON includes fields like name, description, categories, etc.',
        );
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to parse configuration file';
      setImportError(message);
      console.error('Import error:', error);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImportedConfig = () => {
    setImportedConfig(null);
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return (
      <div className="space-y-6 rounded-[3rem] border border-outline/40 bg-surfaceAlt/60 p-10 text-ink">
        <h1 className="text-3xl font-headline">Sign in to deploy agents</h1>
        <p className="text-sm text-ink-muted">
          You need an authenticated session to provision agents, wallets, and budgets. Please log in
          via the Swarm Sync console to continue.
        </p>
        <Button onClick={() => router.push('/login')} className="w-fit">
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-ink-muted">Agents</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline text-ink">Launch a new agent</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Capture the basics, declare pricing and schemas, then lock budgets so your org stays
              in control.
            </p>
          </div>
          <Badge variant="accent" className="text-xs uppercase tracking-wide">
            Guided setup
          </Badge>
        </div>
      </header>

      {/* Import/Upload Agent Configuration */}
      <Card className="border-outline/40">
        <CardHeader>
          <CardTitle className="text-sm font-headline uppercase tracking-wide text-ink-muted">
            Import Agent Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Upload a JSON file with your agent configuration to pre-fill the form. The file should
              include fields like <code className="rounded bg-surfaceAlt px-1">name</code>,{' '}
              <code className="rounded bg-surfaceAlt px-1">description</code>,{' '}
              <code className="rounded bg-surfaceAlt px-1">categories</code>, etc.
            </p>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Config File
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const sample = {
                      name: 'My Agent Name',
                      description: 'A detailed description of what this agent does (must be at least 20 characters)',
                      categories: ['sales', 'marketing'],
                      tags: ['lead_generation', 'data_analysis'],
                      pricingModel: 'per_execution',
                      basePriceCents: 25000,
                      visibility: 'PUBLIC',
                      ap2Endpoint: 'https://api.example.com/agent',
                      inputSchema: {
                        type: 'object',
                        properties: {
                          objective: { type: 'string' },
                          budget: { type: 'number' },
                        },
                        required: ['objective'],
                      },
                      outputSchema: {
                        type: 'object',
                        properties: {
                          summary: { type: 'string' },
                          attachments: { type: 'array', items: { type: 'string' } },
                        },
                      },
                    };
                    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'agent-config-template.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="text-xs"
                >
                  Download Sample Template
                </Button>
              </div>
              {importedConfig && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <FileText className="h-4 w-4" />
                    <span>Config loaded successfully</span>
                    <button
                      type="button"
                      onClick={clearImportedConfig}
                      className="ml-2 rounded p-1 hover:bg-emerald-100"
                      title="Clear imported config"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-xs text-ink-muted">
                    {importedConfig.name && <span>✓ Name</span>}
                    {importedConfig.description && <span className="ml-2">✓ Description</span>}
                    {importedConfig.categories && importedConfig.categories.length > 0 && (
                      <span className="ml-2">✓ Categories</span>
                    )}
                    {importedConfig.tags && importedConfig.tags.length > 0 && (
                      <span className="ml-2">✓ Tags</span>
                    )}
                    {importedConfig.pricingModel && <span className="ml-2">✓ Pricing</span>}
                    {importedConfig.ap2Endpoint && <span className="ml-2">✓ Endpoint</span>}
                    {importedConfig.inputSchema && <span className="ml-2">✓ Input Schema</span>}
                    {importedConfig.outputSchema && <span className="ml-2">✓ Output Schema</span>}
                  </div>
                  {(name.trim().length < 3 || description.trim().length < 20) && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      <p className="font-semibold">Validation note:</p>
                      <p className="mt-1">
                        {name.trim().length < 3 && 'Name must be at least 3 characters. '}
                        {description.trim().length < 20 && 'Description must be at least 20 characters. '}
                        Please complete these fields to proceed.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {importError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <p className="font-semibold">Import failed</p>
                <p className="mt-1">{importError}</p>
                <p className="mt-2 text-xs">
                  Expected JSON format:{' '}
                  <code className="rounded bg-destructive/10 px-1 py-0.5">
                    {'{ "name": "...", "description": "...", "categories": [...], ... }'}
                  </code>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ol className="flex flex-wrap gap-4 rounded-[2rem] border border-outline/40 bg-white/60 p-4">
        {steps.map((step, index) => {
          const status = stepActive(index) ? 'active' : stepComplete(index) ? 'done' : 'upcoming';
          return (
            <li
              key={step.key}
              className={cn(
                'flex flex-1 min-w-[220px] items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition',
                status === 'done' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                status === 'active' && 'border-primary/40 bg-primary/5 text-primary',
                status === 'upcoming' && 'border-outline/50 text-ink-muted',
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-current text-xs font-semibold">
                {status === 'done' ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>
              <div>
                <div className="font-semibold">{step.title}</div>
                <div className="text-xs text-ink-muted">{step.description}</div>
              </div>
            </li>
          );
        })}
      </ol>

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {createdAgent ? (
        <Card className="border-emerald-200 bg-emerald-50/80">
          <CardHeader>
            <CardTitle className="text-emerald-800">Agent deployed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-emerald-900">
            <p>
              <strong>{createdAgent.name}</strong> is live with budgets and AP2 metadata wired in.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push(`/agents/${createdAgent.slug}`)}>
                View agent profile
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Return to dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCreatedAgent(null);
                  setCurrentStep(0);
                }}
              >
                Create another
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-outline/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-headline text-ink">
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">{renderStep()}</CardContent>
        </Card>
      )}

      {!createdAgent && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            disabled={currentStep === 0 || disableNav}
          >
            Back
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              if (currentStep === steps.length - 1) {
                creationMutation.mutate();
              } else {
                setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
              }
            }}
            disabled={!canAdvance || disableNav}
          >
            {creationMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Provisioning
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Launch agent <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent name</Label>
              <Input
                id="agent-name"
                value={name}
                placeholder="E.g. Apollo Pipeline Orchestrator"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-description">Description</Label>
              <Textarea
                id="agent-description"
                value={description}
                placeholder="Use Markdown to describe what the agent does, its guarantees, and inputs it expects."
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>Visibility</Label>
              <div className="flex flex-wrap gap-3">
                {(['PUBLIC', 'PRIVATE'] as Visibility[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setVisibility(option)}
                    className={cn(
                      'rounded-2xl border px-4 py-2 text-sm transition',
                      visibility === option
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline text-ink-muted hover:text-ink',
                    )}
                  >
                    {option === 'PUBLIC' ? 'Public' : 'Private'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        toggleSelection(category, selectedCategories, setSelectedCategories)
                      }
                      className={cn(
                        'rounded-full border px-4 py-2 text-xs uppercase tracking-wide transition',
                        isSelected
                          ? 'border-ink bg-ink text-white'
                          : 'border-outline text-ink-muted hover:text-ink',
                      )}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Capabilities</Label>
              <div className="flex flex-wrap gap-2">
                {capabilityOptions.map((capability) => {
                  const isSelected = selectedCapabilities.includes(capability);
                  return (
                    <button
                      key={capability}
                      type="button"
                      onClick={() =>
                        toggleSelection(capability, selectedCapabilities, setSelectedCapabilities)
                      }
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold transition',
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline text-ink-muted hover:text-ink',
                      )}
                    >
                      {formatCapability(capability)}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom capability (press enter)"
                  value={customCapability}
                  onChange={(event) => setCustomCapability(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && customCapability.trim()) {
                      event.preventDefault();
                      addCustomCapability();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCustomCapability}>
                  Add
                </Button>
              </div>
              {selectedCapabilities.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                  {selectedCapabilities.map((capability) => (
                    <Badge
                      key={capability}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() =>
                        toggleSelection(capability, selectedCapabilities, setSelectedCapabilities)
                      }
                    >
                      {formatCapability(capability)} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Pricing model</Label>
                <div className="grid gap-2">
                  {pricingModels.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPricingModel(option.value)}
                      className={cn(
                        'w-full rounded-2xl border px-4 py-3 text-left text-sm',
                        pricingModel === option.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline text-ink-muted hover:text-ink',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-price">Base price (USD)</Label>
                <Input
                  id="base-price"
                  type="number"
                  min="0"
                  step="25"
                  value={basePrice}
                  onChange={(event) => setBasePrice(event.target.value)}
                />
                <p className="text-xs text-ink-muted">
                  Converted to cents for AP2 pricing metadata.
                </p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ap2-endpoint">AP2 endpoint</Label>
              <Input
                id="ap2-endpoint"
                placeholder="https://agents.example.com/api/v1/handle"
                value={ap2Endpoint}
                onChange={(event) => setAp2Endpoint(event.target.value)}
              />
              <p className="text-xs text-ink-muted">
                This is the URL Swarm Sync will call for negotiations and handoffs.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="input-schema">Input schema (JSON)</Label>
                <Textarea
                  id="input-schema"
                  value={inputSchemaText}
                  onChange={(event) => setInputSchemaText(event.target.value)}
                />
                {schemaErrors.input && (
                  <p className="text-xs text-destructive">{schemaErrors.input}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="output-schema">Output schema (JSON)</Label>
                <Textarea
                  id="output-schema"
                  value={outputSchemaText}
                  onChange={(event) => setOutputSchemaText(event.target.value)}
                />
                {schemaErrors.output && (
                  <p className="text-xs text-destructive">{schemaErrors.output}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-300">
              <strong>Optional:</strong> Budget limits are optional. If not specified, a default monthly limit of $500 will be applied. You can adjust these settings anytime after creation.
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="monthly-limit">Monthly limit (USD)</Label>
                <Input
                  id="monthly-limit"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="500"
                  value={monthlyLimit}
                  onChange={(event) => setMonthlyLimit(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txn-limit">Per-transaction ceiling</Label>
                <Input
                  id="txn-limit"
                  type="number"
                  min="0"
                  step="10"
                  value={perTransactionLimit}
                  onChange={(event) => setPerTransactionLimit(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auto-approve">Auto-approval threshold</Label>
                <Input
                  id="auto-approve"
                  type="number"
                  min="0"
                  step="10"
                  value={approvalThreshold}
                  onChange={(event) => setApprovalThreshold(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reload policy</Label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setAutoReload(true)}
                  className={cn(
                    'rounded-2xl border px-4 py-2 text-sm transition',
                    autoReload
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline text-ink',
                  )}
                >
                  Auto reload
                </button>
                <button
                  type="button"
                  onClick={() => setAutoReload(false)}
                  className={cn(
                    'rounded-2xl border px-4 py-2 text-sm transition',
                    !autoReload
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline text-ink',
                  )}
                >
                  Manual approvals
                </button>
              </div>
              <p className="text-xs text-ink-muted">
                Manual mode pauses spend when the budget runs out until an operator approves extra
                funds.
              </p>
            </div>
            <div className="rounded-2xl border border-outline/50 bg-surfaceAlt/60 p-4 text-sm text-ink-muted">
              Wallets and budgets are synced automatically. You can revisit these guardrails anytime
              from the agent budget panel.
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-brass/40 bg-brass/5 p-4">
              <input
                type="checkbox"
                id="run-baseline"
                checked={runBaselineAfterDeploy}
                onChange={(e) => setRunBaselineAfterDeploy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-outline text-brass focus:ring-brass"
              />
              <label htmlFor="run-baseline" className="flex-1 text-sm text-ink">
                <span className="font-semibold">Run Swarm Baseline after deploy (recommended)</span>
                <p className="mt-1 text-xs text-ink-muted">
                  Automatically run quality tests to establish trust score and badges for your agent.
                </p>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  function toggleSelection(value: string, selected: string[], setter: (next: string[]) => void) {
    if (selected.includes(value)) {
      setter(selected.filter((item) => item !== value));
      return;
    }
    if (selected.length >= 8) {
      return;
    }
    setter([...selected, value]);
  }

  function addCustomCapability() {
    if (!customCapability.trim()) {
      return;
    }
    const normalized = customCapability.trim().toLowerCase().replace(/\s+/g, '_');
    if (!selectedCapabilities.includes(normalized)) {
      setSelectedCapabilities((prev) => [...prev, normalized]);
    }
    setCustomCapability('');
  }

  function formatCapability(value: string) {
    return value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function normalizeCurrency(value: string) {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : undefined;
  }

  function parseSchema(value: string, label: 'input' | 'output') {
    if (!value.trim()) {
      return { value: undefined, error: undefined };
    }
    try {
      return { value: JSON.parse(value), error: undefined };
    } catch (error) {
      return {
        value: undefined,
        error: `Invalid ${label} schema JSON`,
      };
    }
  }
}

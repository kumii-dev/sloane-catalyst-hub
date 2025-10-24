import { supabase } from '@/integrations/supabase/client';
import { ModelState } from '@/store/modelStore';

export interface SavedModel {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Save a financial model to the database
 */
export async function saveModel(
  name: string,
  modelState: ModelState
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to save models');
  }

  // Check if updating existing model
  if (modelState.currentModelId) {
    const { error } = await supabase
      .from('model_states')
      .update({
        name,
        model_data: modelState as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', modelState.currentModelId)
      .eq('user_id', user.id);

    if (error) throw error;
    return modelState.currentModelId;
  }

  // Create new model
  const { data, error } = await supabase
    .from('model_states')
    .insert([{
      user_id: user.id,
      name,
      model_data: modelState as any,
    }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create model');

  return data.id;
}

/**
 * Load a financial model from the database
 */
export async function loadModel(modelId: string): Promise<ModelState | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to load models');
  }

  const { data, error } = await supabase
    .from('model_states')
    .select('model_data')
    .eq('id', modelId)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  if (!data) return null;

  return data.model_data as unknown as ModelState;
}

/**
 * List all models for the current user
 */
export async function listModels(): Promise<SavedModel[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to list models');
  }

  const { data, error } = await supabase
    .from('model_states')
    .select('id, name, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Delete a financial model
 */
export async function deleteModel(modelId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to delete models');
  }

  const { error } = await supabase
    .from('model_states')
    .delete()
    .eq('id', modelId)
    .eq('user_id', user.id);

  if (error) throw error;
}
